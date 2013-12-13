
var SaikuTableRenderer = _.extend(SaikuRenderer, {

    key: "table",
});

SaikuTableRenderer.prototype._render = function(data, options) {
        if (data) {
            this._data = data;
        }
        if (options) {
            this._options = _.extend(options, SaikuRendererOptions);
        }

        if (typeof this._data == "undefined") {
            return;
        }

        if (this._data != null && this._data.error != null) {
            return;
        }        
        if (this._data == null || (this._data.cellset && this._data.cellset.length === 0)) {
            return;
        }

        var html =  this.internalRender(this._data.cellset);
        if (this._options.htmlObject) {
            $(this._options.htmlObject).html(html);
        }
        return html;
};

SaikuTableRenderer.prototype._processData = function(data, options) {
    this._hasProcessed = true;
};

SaikuTableRenderer.prototype.internalRender = function(data, options) {
    var contents = "";
    var table = data ? data : [];
    var colSpan;
    var colValue;
    var isHeaderLowestLvl;
    var isBody = false;
    var firstColumn;
    var isLastColumn, isLastRow;
    var nextHeader;
    var processedRowHeader = false;
    var lowestRowLvl = 0;
    var rowGroups = [];

    for (var row = 0; row < table.length; row++) {
        colSpan = 1;
        colValue = "";
        isHeaderLowestLvl = false;
        isLastColumn = false;
        isLastRow = false;

        contents += "<tr>";

        for (var col = 0; col < table[row].length; col++) {
            var header = data[row][col];

            // If the cell is a column header and is null (top left of table)
            if (header.type === "COLUMN_HEADER" && header.value === "null" && (firstColumn == null || col < firstColumn)) {
                contents += '<th class="all_null"><div>&nbsp;</div></th>';
            } // If the cell is a column header and isn't null (column header of table)
            else if (header.type === "COLUMN_HEADER") {
                if (firstColumn == null) {
                    firstColumn = col;
                }
                if (table[row].length == col+1)
                    isLastColumn = true;
                else
                    nextHeader = data[row][col+1];


                if (isLastColumn) {
                    // Last column in a row...
                    if (header.value == "null") {
                        contents += '<th class="col_null"><div>&nbsp;</div></th>';
                    } else {
                        contents += '<th class="col" style="text-align: center;" colspan="' + colSpan + '" title="' + header.value + '"><div rel="' + row + ":" + col +'">' + header.value + '</div></th>';    
                    }
                    
                } else {
                    // All the rest...
                    var groupChange = (col > 1 && row > 1 && !isHeaderLowestLvl && col > firstColumn) ?
                        data[row-1][col+1].value != data[row-1][col].value
                        : false;
                    var maxColspan = colSpan > 999 ? true : false;
                    if (header.value != nextHeader.value || isHeaderLowestLvl || groupChange || maxColspan) {
                        if (header.value == "null") {
                            contents += '<th class="col_null" colspan="' + colSpan + '"><div>&nbsp;</div></th>';
                        } else {
                            contents += '<th class="col" style="text-align: center;" colspan="' + (colSpan == 0 ? 1 : colSpan) + '" title="' + header.value + '"><div rel="' + row + ":" + col +'">' + header.value + '</div></th>';
                        }
                        colSpan = 1;
                    } else {
                        colSpan++;
                    }
                }
            } // If the cell is a row header and is null (grouped row header)
            else if (header.type === "ROW_HEADER" && header.value === "null") {
                contents += '<th class="row_null"><div>&nbsp;</div></th>';
            } // If the cell is a row header and isn't null (last row header)
            else if (header.type === "ROW_HEADER") {
                if (lowestRowLvl == col)
                    isHeaderLowestLvl = true;
                else
                    nextHeader = data[row][col+1];

                var previousRow = data[row - 1];

                var same = !isHeaderLowestLvl && (col == 0 || previousRow[col-1].value == data[row][col-1].value) && header.value === previousRow[col].value;
                var value = (same ? "<div>&nbsp;</div>" : '<div rel="' + row + ":" + col +'">' + header.value + '</div>');
                var tipsy = "";
                /* var tipsy = ' original-title="';
                if (!same && header.metaproperties) {
                    for (key in header.metaproperties) {
                        if (key.substring(0,1) != "$" && key.substring(1,2).toUpperCase() != key.substring(1,2)) {
                            tipsy += "<b>" + safe_tags_replace(key) + "</b> : " + safe_tags_replace(header.metaproperties[key]) + "<br>";
                        }
                    }
                }
                tipsy += '"';
                */
                var cssclass = (same ? "row_null" : "row");
                var colspan = 0;

                if (!isHeaderLowestLvl && (typeof nextHeader == "undefined" || nextHeader.value === "null")) {
                    colspan = 1;
                    var group = header.properties.dimension;
                    var level = header.properties.level;
                    var groupWidth = (group in rowGroups ? rowGroups[group].length - rowGroups[group].indexOf(level) : 1);
                    for (var k = col + 1; colspan < groupWidth && k <= (lowestRowLvl+1) && data[row][k] !== "null"; k++) {
                        colspan = k - col;
                    }
                    col = col + colspan -1;
                }
                contents += '<th class="' + cssclass + '" ' + (colspan > 0 ? ' colspan="' + colspan + '"' : "") + tipsy + '>' + value + '</th>';
            }
            else if (header.type === "ROW_HEADER_HEADER") {
                contents += '<th class="row_header"><div>' + header.value + '</div></th>';
                isHeaderLowestLvl = true;
                processedRowHeader = true;
                lowestRowLvl = col;
                if (header.properties.hasOwnProperty("dimension")) {
                    var group = header.properties.dimension;
                    if (!(group in rowGroups)) {
                        rowGroups[group] = [];
                    }
                    rowGroups[group].push(header.properties.level);
                }
            } // If the cell is a normal data cell
            else if (header.type === "DATA_CELL") {
                var color = "";
                var val = header.value;
                var arrow = "";
                if (header.properties.hasOwnProperty('image')) {
                    var img_height = header.properties.hasOwnProperty('image_height') ? " height='" + header.properties.image_height + "'" : "";
                    var img_width = header.properties.hasOwnProperty('image_width') ? " width='" + header.properties.image_width + "'" : "";
                    val = "<img " + img_height + " " + img_width + " style='padding-left: 5px' src='" + header.properties.image + "' border='0'>";
                }

                if (header.properties.hasOwnProperty('style')) {
                    color = " style='background-color: " + header.properties.style + "' ";
                }
                if (header.properties.hasOwnProperty('link')) {
                    val = "<a target='__blank' href='" + header.properties.link + "'>" + val + "</a>";
                }
                if (header.properties.hasOwnProperty('arrow')) {
                    arrow = "<img height='10' width='10' style='padding-left: 5px' src='./images/arrow-" + header.properties.arrow + ".gif' border='0'>";
                }

                contents += '<td class="data" ' + color + '><div alt="' + header.properties.raw + '" rel="' + header.properties.position + '">' + val + arrow + '</div></td>';
            }
        }
        contents += "</tr>";
        
    }
    return "<table>" + contents + "</table>";
}
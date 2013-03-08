/*  
 *   Copyright 2012 OSBI Ltd
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

/**
 * Renders a chart for each workspace
 */
var Chart = Backbone.View.extend({

	cccOptions: {
        type: "BarChart",
        stacked: false
    },

    data: null,

    getChartProperties: function(chartName) { 
        var self = this; 
        var ret = [];
        _.each(ChartProperties, function(property) {
            if (property.ChartObject == chartName) {
                ret.push(property);
            }

        });
        return ret;

    },

    initialize: function(args) {
        this.workspace = args.workspace;
        
        // Create a unique ID for use as the CSS selector
        this.id = _.uniqueId("chart_");
        $(this.el).attr({ id: this.id });
        this.cccOptions.canvas = this.id;
        this.cccOptions = this.getQuickOptions(this.cccOptions);

        this.data = null;
        
        // Bind table rendering to query result event
        _.bindAll(this, "receive_data", "process_data", "show",  "getData", "render_view", "render_chart", "getQuickOptions");
        this.workspace.bind('query:result', this.receive_data);
        Saiku.session.bind('workspace:new', this.render_view);
        
        
        // Listen to adjust event and rerender chart
        this.workspace.bind('workspace:adjust', this.render);
        
        // Create navigation
        var exportoptions = "<div><a class='hide' href='#charteditor' id='acharteditor' /><a class='editor' href='#chart_editor'>Advanced Properties</a>Export to: " +
                "<a class='export' href='#png' class='i18n'>PNG</a>, " +
                "<a class='export' href='#pdf' class='i18n'>PDF</a>, " +
                "<a class='export' href='#tiff' class='i18n'>TIFF</a>, " +
                "<a class='export' href='#svg' class='i18n'>SVG</a>, " +
                "<a class='export' href='#jpg' class='i18n'>JPG</a>" +
                "<form id='svgChartPseudoForm' action='/saiku/svg' method='POST'>" +
                "<input type='hidden' name='type' class='type'/>" +
                "<input type='hidden' name='svg' class='svg'/>" +
                "</form>";

        var chartnav = (Settings.PLUGIN) ? "" : exportoptions + "</div>";
        
        // Create navigation
        this.nav = $(chartnav).css({
        		    'padding-bottom': '10px'
        		});
        this.nav.find('a.type').css({
                    color: '#666',
                    'margin-right': '5px',
                    'text-decoration': 'none',
                    'border': '1px solid #ccc',
                    padding: '5px'
                });

        this.nav.find('a.export').click(this.exportChart);
        

        this.nav.find('a').css({ 
                    color: '#666', 
                    'margin-right': '5px', 
                    'text-decoration': 'none', 
                    'border': '1px solid #ccc', 
                    padding: '5px' 
                });
        $(this.nav).append('<div style="display:none;"> <div id="charteditor" class="chart_editor"></div></div>');
        
        this.editor = new ChartEditor({  workspace : this.workspace, 
                                        ChartProperties : ChartProperties, 
                                        ChartTypes: ChartTypes, 
                                        data : this.getData, 
                                        getChartProperties : this.getChartProperties});

        $(this.nav).find('.chart_editor').append($(this.editor.el));

    },

    
    exportChart: function(event) {
        var type = $(event.target).attr('href').replace('#', '');
        var svgContent = new XMLSerializer().serializeToString($('svg')[0]);
        var form = $('#svgChartPseudoForm');
        form.find('.type').val(type);
        form.find('.svg').val(svgContent);
        form.submit();
        return false;
    },

    render_view: function() {
    	// Append chart to workspace
        $(this.workspace.el).find('.workspace_results')
            .prepend($(this.el).hide())
            .prepend(this.nav.hide());

    },
    
    getData: function() {
        return this.data;

    },

    show: function(event, ui) {
        $(this.el).show();
        $(this.nav).show();
        $('a#acharteditor').fancybox(
                                   {
                                   'autoDimensions'    : false,
                                   'autoScale'         : false,
                                   'height'            :  ($("body").height() - 140),
                                   'width'             :  ($("body").width() - 100),
                                   'transitionIn'      : 'none',
                                   'transitionOut'     : 'none',
                                   'type'              : 'inline'
                                   }
                               );

        if (this.cccOptions.width <= 0) {
            this.cccOptions.width = $(this.workspace.el).find('.workspace_results').width() - 40;
        }
        if (this.cccOptions.height <= 0) {
            this.cccOptions.height = $(this.workspace.el).find('.workspace_results').height() - 40;
        }

        this.process_data({ data: this.workspace.query.result.lastresult() });
    },

    chart_editor: function() {
		$('a#acharteditor').click();
		return true;
    },

    stackedBar: function() {
        var options = {
                stacked: true,
                type: "BarChart",
        };
        this.cccOptions = this.getQuickOptions(options);
        this.render_chart();
    },
    
    bar: function() {
        var options = {
                stacked: false,
                type: "BarChart",
        };
        this.cccOptions = this.getQuickOptions(options);
        this.render_chart();
        
        /*
        this.cccOptions.multiChartIndexes = [1];
        this.cccOptions.dataMeasuresInColumns = true;
        this.cccOptions.orientation = 'horizontal';
        this.cccOptions.smallTitlePosition = 'top';
        this.cccOptions.multiChartColumnsMax = 5;
        this.cccOptions.smallWidth = 100;
        this.cccOptions.smallHeight = 300;
		*/
    },
    
    line: function() {
        var options = {
                stacked: false,
                type: "LineChart",
        };
        this.cccOptions = this.getQuickOptions(options);
        this.render_chart();
    },
    
    pie: function() {
        var options = {
                stacked: false,
                type: "PieChart",
                multiChartIndexes: [1]
        };
        this.cccOptions = this.getQuickOptions(options);
        this.render_chart();
    },

    heatgrid: function() {
        var options = {
                stacked: false,
                type: "HeatGridChart"
        };
        this.cccOptions = this.getQuickOptions(options);
        this.render_chart();
    },

    getQuickOptions: function(baseOptions) {
        var options = _.extend({        
            canvas: this.id,
            width: $(this.workspace.el).find('.workspace_results').width() - 40,
            height: $(this.workspace.el).find('.workspace_results').height() - 40,
            orientation: 'vertical',
            stacked: false,
            animate: false,
            selectable: true,
            showValues: false,
            legend: true,
            legendPosition:"top",
            legendAlign: "right",
            colors: ["#4bb2c5", "#c5b47f", "#EAA228", "#579575", "#839557", "#958c12", "#953579", "#4b5de4", "#d8b83f", "#ff5800", "#0085cc"],
            type: 'BarChart'
        }, baseOptions);
        
        if (options.type == "HeatGridChart") {
            options = _.extend({
                    canvas: this.id,
                    width: $(this.workspace.el).find('.workspace_results').width() - 40,
                    height: $(this.workspace.el).find('.workspace_results').height() - 40,
                    orientation: "horizontal",
                    useShapes:     true,
                    shape:         'circle',
                    nullShape:     'cross',
                    colorNormByCategory: false,
                    sizeRole:      'value', 
                    ctrlSelectMode: true,
                    hoverable:      true,
                    valuesVisible:  false,
                    axisComposite: true,
                    colors: ['red', 'yellow', 'lightgreen', 'darkgreen'],
                    selectable: true,
                    xAxisSize: 130,
                    extensionPoints: {
                        xAxisLabel_textAngle: - (Math.PI / 2),
                        xAxisLabel_textAlign: "right",
                        xAxisLabel_bottom: 10
                    }
            }, baseOptions);
        }
        if (this.data != null && this.data.resultset.length > 5 ) {
            options['extensionPoints'] = {
                xAxisLabel_textAngle: -(Math.PI / 2),
                xAxisLabel_textAlign: "right",
                xAxisLabel_bottom: 10
            };
            
            options.xAxisSize = 100;
        }

        return options;
    },
    
    render_chart: function() {
        if (! $(this.workspace.querytoolbar.el).find('.render_chart').hasClass('on')) {
            return;
        }
        

        this.editor.chartDefinition = _.clone(this.cccOptions);
        this.editor.set_chart("pvc." + this.cccOptions.type);
        this.editor.render_chart_properties("pvc." + this.cccOptions.type, this.editor.chartDefinition);

        this.chart = new pvc[this.cccOptions.type](this.cccOptions);
        
        this.chart.setData(this.data, {
            crosstabMode: true,
            seriesInRows: false
        });
        
        try {
            this.chart.render();
            Saiku.i18n.automatic_i18n();
        } catch (e) {
            $(this.el).text("Could not render chart");
        }
    },
            
    receive_data: function(args) {
        if (! $(this.workspace.querytoolbar.el).find('.render_chart').hasClass('on')) {
            return;
        }
        return _.delay(this.process_data, 0, args);

    },
    
     process_data: function(args) {
        this.data = {};
        this.data.resultset = [];
        this.data.metadata = [];
        this.data.height = 0;
        this.data.width = 0;

        if (typeof args.data == "undefined")
            return false;

        var cellset = args.data.cellset;
        if (cellset && cellset.length > 0) {
            
            var lowest_level = 0;
            var data_start = 0;
            for (var row = 0; data_start == 0 && row < cellset.length; row++) {
                    this.data.metadata = [];
                    for (var field = 0; field < cellset[row].length; field++) {
                        var firstHeader = [];

                        while (cellset[row][field].type == "COLUMN_HEADER" && cellset[row][field].value == "null") {
                            row++;
                        }
                        if (cellset[row][field].type == "ROW_HEADER_HEADER") {

                            while(cellset[row][field].type == "ROW_HEADER_HEADER") {
                                firstHeader.push(cellset[row][field].value);
                                field++;
                            }

                            this.data.metadata.push({
                                colIndex: 0,
                                colType: "String",
                                colName: firstHeader.join('/')
                            });    
                            lowest_level = field - 1;
                        }
                        if (cellset[row][field].type == "COLUMN_HEADER" && cellset[row][field].value != "null") {
                            var lowest_col_header = 0;
                            var colheader = [];
                            while(lowest_col_header <= row) {
                                colheader.push(cellset[lowest_col_header][field].value);
                                lowest_col_header++;
                            }
                            this.data.metadata.push({
                                colIndex: field - lowest_level + 1,
                                colType: "Numeric",
                                colName: colheader.join('/')
                            });

                            data_start = row+1;
                        }
                    }
            }
            var labelsSet = {};
            for (var row = data_start; row < cellset.length; row++) {
            if (cellset[row][0].value !== "") {
                    var record = [];
                    this.data.width = cellset[row].length - lowest_level + 1;
                    var label = "";
                    for (var labelCol = lowest_level; labelCol >= 0; labelCol--) {
                        var lastKnownUpperLevelRow = row;
                        while(cellset[lastKnownUpperLevelRow] && cellset[lastKnownUpperLevelRow][labelCol].value === 'null') {
                            --lastKnownUpperLevelRow;
                        }
                        if(cellset[lastKnownUpperLevelRow]) {
                            if (label == "") {
                                label = cellset[lastKnownUpperLevelRow][labelCol].value;
                            } else {
                                label = cellset[lastKnownUpperLevelRow][labelCol].value + " / " + label;
                            }
                        }
                    }
                    if(label in labelsSet) {
                        labelsSet[label] = labelsSet[label]+1;
                        label = label + ' [' + (labelsSet[label] + 1) + ']';
                    } else {
                        labelsSet[label] = 0;
                    }
                    record.push(label);

                    for (var col = lowest_level + 1; col < cellset[row].length; col++) {
                        var cell = cellset[row][col];
                        var value = cell.value || 0;
                        // check if the resultset contains the raw value, if not try to parse the given value
                        var raw = cell.properties.raw;
                        if (raw && raw !== "null") {
                            value = parseFloat(raw);
                        } else if (typeof(cell.value) !== "number" && parseFloat(cell.value.replace(/[^a-zA-Z 0-9.]+/g,''))) {
                            value = parseFloat(cell.value.replace(/[^a-zA-Z 0-9.]+/g,''));
                        }
                        record.push(value);
                    }
                    this.data.resultset.push(record);
                }
            }
            //makeSureUniqueLabels(this.data.resultset);
            this.data.height = this.data.resultset.length;
            this.render_chart();
        } else {
            $(this.el).text("No results");
        }
    }
});



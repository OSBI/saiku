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

	options: {},

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

        this.data = null;
        
        // Bind table rendering to query result event
        _.bindAll(this, "receive_data", "process_data", "show",  "getData", "render_view", "render_quick", "show_table");
        this.workspace.bind('query:result', this.receive_data);
        Saiku.session.bind('workspace:new', this.render_view);
        
        // Add chart button
        this.workspace.toolbar.chart = this.show;
        
        // Listen to adjust event and rerender chart
        this.workspace.bind('workspace:adjust', this.render);
        
        // Create navigation
        var exportoptions = "<div><a id='inline' href='#chartpopup' class='hide charteditor i18n' />Export to: " +
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
        $(this.el).append('<div style="display:none"><div id="chartpopup"></div></div>');
        
        this.editor = new ChartEditor({  workspace : this.workspace, 
                                        ChartProperties : ChartProperties, 
                                        ChartTypes: ChartTypes, 
                                        data : this.getData, 
                                        getChartProperties : this.getChartProperties});

        $(this.el).find('#chartpopup').append($(this.editor.el));

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
    	var self = this;
        $target =  $(event.target);
        $body = $(document);
        if (!$(event.target).hasClass('on')) {
            this.process_data({ data: this.workspace.query.result.lastresult() });
        }

        $body.off('.contextMenu .contextMenuAutoHide');
        $('.context-menu-list').remove();
        $.contextMenu('destroy');
        $.contextMenu({
            appendTo: $target,
            selector: '.chart', 
            ignoreRightClick: true,
            build: function($trigger, e) {
             	var citems = {
                        "bar" : {name: "Bar Chart" },
						"stackedBar" : {name: "Stacked Bar Chart" },
						"line" : {name: "Line Chart" },
						"pie" : {name: "Pie Chart" },
						"heatgrid" : {name: "Heat Grid" },
						"sep1" : "-------",
						"chart_editor" : {name: "Chart Editor..." },
						"show_table" : {name: "Show Table"}
                };

            return {
                    callback: function(key, options) {
                    			$(self.workspace.toolbar.el).find('.chart').addClass('on');
                    			$(self.workspace.el).find('.workspace_results table').hide();
                    			$(self.nav).show();
                    			$('a#inline').fancybox(
						            {
						            'autoDimensions'    : false,
						            'autoScale'         : false,
						            'height'            :  ($("body").height() - 100),
						            'width'             :  ($("body").width() - 100),
						            'transitionIn'      : 'none',
						            'transitionOut'     : 'none',
						            'type'              : 'inline'
						            }
						        );
                                try {
						            self[key]();
						        } catch (e) { }
						        return true;

                    },
                    items: citems
                 }
            }
          }); 
    	
    	$target.contextMenu();


    },

    show_table: function() {
    	$(this.workspace.toolbar.el).find('.chart').removeClass('on');
    	$(this.workspace.el).find('.workspace_results table').show();
        $(this.el).hide();
        $(this.nav).hide();
        return true;
    },

    chart_editor: function() {
		$('a#inline').click();
		return true;

    },

    stackedBar: function() {
        this.options.stacked = true;
        this.options.type = "BarChart";
        this.options.multiChartIndexes = null;
        this.render_quick();
    },
    
    bar: function() {
        this.options.stacked = false;
        this.options.type = "BarChart";
        this.options.multiChartIndexes = null;
        this.render_quick();
    },
    
    line: function() {
        this.options.stacked = false;
        this.options.type = "LineChart";
        this.options.multiChartIndexes = null;
        this.render_quick();
    },
    
    pie: function() {
        this.options.stacked = false;
        this.options.type = "PieChart";
        this.options.multiChartIndexes = [1];
        this.render_quick();
    },

    heatgrid: function() {
        this.options.stacked = false;
        this.options.type = "HeatGridChart";
        this.options.multiChartIndexes = null;
        this.render_quick();
    },

    
    render_quick: function() {
        if (! $(this.workspace.toolbar.el).find('.chart').hasClass('on')) {
            return;
        }
        
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
        }, this.options);
        
        if (options.type == "HeatGridChart") {
            options = _.extend({
                    canvas: this.id,
                    width: $(this.workspace.el).find('.workspace_results').width() - 40,
                    height: $(this.workspace.el).find('.workspace_results').height() - 40,
                    orientation: "horizontal",
                    selectable: true,
                    extensionPoints: {
                        xAxisLabel_textAngle: -(Math.PI / 2),
                        xAxisLabel_textAlign: "right",
                        xAxisLabel_bottom: 10
                    }
            }, this.options);
        }
        if (this.data.resultset.length > 5 ) {
            options.extensionPoints = {
                xAxisLabel_textAngle: -(Math.PI / 2),
                xAxisLabel_textAlign: "right",
                xAxisLabel_bottom: 10
            };
            
            options.xAxisSize = 100;
        }
        
        this.chart = new pvc[options.type](options);
        
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
        if (! $(this.workspace.toolbar.el).find('.chart').hasClass('on')) {
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
            this.render_quick();
        } else {
            $(this.el).text("No results");
        }
    }
});


var ChartEditor = Backbone.View.extend({
    events: {
        'change .chartlist': 'change_chart',
        'click  td' : 'click_property',
        'click input.save_chart' : 'save_chart'
    },

    templateEditor :
     '<div class="chartworkspace">' 
    +'    <div class="sidebar">'
    +'<span>'
    +'        <div>'
    +'            <h3 class="top i18n">Charts</h3>'
    +'        </div>'
    +'        <div class="sidebar_inner">'
    +'            <%= chartList %>'
    +'        </div>'
    +'        <h3 class="i18n">Properties</h3>'
    +'        <div class="sidebar_inner properties_table"></div>'
    +'    </div>  '
    +'    <div class="sidebar_separator"></div>'
    +' </span></span>'
    +' <input class="save_chart" type="submit" value="SAVE CHART" /> <br >'
    +'        <div class="chartworkspace_inner">'
    +'        </div></span>'
    +'    </div>' ,
    
    chartDefinition: {},

    initialize: function(args) {
        // Don't lose this
        _.bindAll(this, "change_chart", "render_chart_properties", "click_property", "save_property", "cancel_property", 
                            "check_input", "get_chart_definition", "getData", "render_chart");
        
        // Bind parent element
        this.workspace = args.workspace;
        this.ChartProperties = args.ChartProperties;
        this.ChartTypes = args.ChartTypes;
        this.getData = args.data;
        this.getChartProperties = args.getChartProperties;
        this.chartDefinition = {};
        var chartList = "<select class='chartlist'>";
        _.each(this.ChartTypes, function(chart) {
            chartList += "<option value='" + chart.ChartObject + "'>" + chart.ChartName + "</option>";
        });
        chartList += "</select>";

        $(this.el).html(_.template(this.templateEditor)({chartList : chartList}));
        $(this.el).find('.chartworkspace_inner').css({ 'margin-left': 400 });
        $(this.el).find('.sidebar').css({ 'width': "400" });
        this.chartId = _.uniqueId("chartobject_");
        $(this.el).find('.chartworkspace_inner').html("<div id='"+ this.chartId + "'></div>")

        this.change_chart();

    },

    getData: function() {},

    change_chart: function() {
        var chart = $(this.el).find('.chartlist').val();
        this.render_chart_properties(chart);

    },

    render_chart_properties: function(chartName) {
        var options = this.getChartProperties(chartName);
        options = _.sortBy(options, function(property){ return property.Order; });

        var table = "<table class='propertiesviewer' style='border: 1px solid grey'>";
        _.each(options, function(property) {
            table += "<tr>"
            + "<td class='data property' title='" + property.Tooltip + "' href='#" + property.Name + "'>" + property.Description + "</td>"
            + "<td class='data value' alt='" + property.DefaultValue + "'>" + property.DefaultValue + "</td></tr>";
        });
        table += "</table>";

        $(this.el).find('.properties_table').html(table);
        $(this.el).find('.properties_table td').css({ "border-bottom" : "1px solid grey"});
    },

    click_property: function(event) {
        $target = $(event.target).hasClass('value') ?
            $(event.target) : $(event.target).parent().find('.value');

        var value = $target.text();
        
        
        var $input = $("<input type='text' value='" + value + "' />").css({ "width" : $target.width() })
            .keyup(this.check_input)
            .blur(this.cancel_property);
        $target.html('').append($input);
        $input.focus();
    },
    
    check_input: function(event) {
        if (event.which == 13) {
            this.save_property(event);
        } else if (event.which == 27 || event.which == 9) {
            this.cancel_property(event);
        }
         
        return false;
    },
    
    save_property: function(event) {
        var $input = $(event.target).closest('input');
        var value = $input.val();
        $input.parent().text(value);
        this.get_chart_definition();
    },

    get_chart_definition: function() {
    this.chartDefinition = {};
    var self = this;
        $(this.el).find('.properties_table tr').each(function(index, element) {
            var property = $(element).find('.property').attr('href').replace('#','');
            var value = $(element).find('.value').text();
            if (typeof value != "undefined" && value.length > 0) {
                self.chartDefinition[property] = value;
            }
            
        });
    this.render_chart();
    
    },

    render_chart: function() {

        var chartName = $(this.el).find('.chartlist').val().replace('pvc.','');
        
        var options = this.chartDefinition;
        options['canvas'] = this.chartId;
        
        this.chart = new pvc[chartName](options);
        
        this.chart.setData(this.getData(), {
            crosstabMode: true,
            seriesInRows: false
        });
        
        try {
            this.chart.render();
            Saiku.i18n.automatic_i18n();
        } catch (e) {
            $(this.el).find('#' + this.chartId ).text("Could not render chart<br>" + e);
        }
    },

    cancel_property: function(event) {
        var $input = $(event.target).closest('input');
        $input.parent().text($input.parent().attr('alt'));
    },

    save_chart: function(event) {
    	//this.workspace.chart.chart = _.clone(this.chart);
    	//this.workspace.chart.chart.options.canvas = this.workspace.chart.id;
    	//this.workspace.chart.chart.render();
    	return false;
    }
    

});
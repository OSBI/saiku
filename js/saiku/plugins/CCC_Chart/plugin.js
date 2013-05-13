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
        stacked: true
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
        _.bindAll(this, "receive_data", "process_data", "show",  "getData", "render_view", "render_chart", "getQuickOptions","exportChart","block_ui");
        var self = this;
        this.workspace.bind('query:run',  function() {
            if (! $(self.workspace.querytoolbar.el).find('.render_chart').hasClass('on')) {
                return false;
            }
            self.data = {};
            self.data.resultset = [];
            self.data.metadata = [];
            self.render_chart();
            return false;
        });

        this.workspace.bind('query:fetch', this.block_ui);
        
        this.workspace.bind('query:result', this.receive_data);
        Saiku.session.bind('workspace:new', this.render_view);
        
        
        // Listen to adjust event and rerender chart
        this.workspace.bind('workspace:adjust', this.render);
        
        // Create navigation
        var exportoptions = "<div><a class='hide' href='#charteditor' id='acharteditor' /><!--<a class='editor' href='#chart_editor'>Advanced Properties</a>-->Export to: " +
                "<a class='export' href='#png' class='i18n'>PNG</a>, " +
                "<a class='export' href='#pdf' class='i18n'>PDF</a>, " +
                //"<a class='export' href='#tiff' class='i18n'>TIFF</a>, " +
                "<a class='export' href='#svg' class='i18n'>SVG</a>, " +
                "<a class='export' href='#jpg' class='i18n'>JPG</a>" +
                "<form id='svgChartPseudoForm' target='_blank' method='POST'>" +
                "<input type='hidden' name='type' class='type'/>" +
                "<input type='hidden' name='svg' class='svg'/>" +
                "</form>";

        var chartnav = exportoptions + "</div>";
        
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
        /* XXX - enable again later
        $(this.nav).append('<div style="display:none;"> <div id="charteditor" class="chart_editor"></div></div>');
        
        this.editor = new ChartEditor({  workspace : this.workspace, 
                                        ChartProperties : ChartProperties, 
                                        ChartTypes: ChartTypes, 
                                        data : this.getData, 
                                        getChartProperties : this.getChartProperties});

        $(this.nav).find('.chart_editor').append($(this.editor.el));
        */

    },

    block_ui: function() {
        if (! $(this.workspace.querytoolbar.el).find('.render_chart').hasClass('on')) {
            return;
        }
        Saiku.ui.block("Updating chart data....");
    },

    exportChart: function(event) {
        var type = $(event.target).attr('href').replace('#', '');
        var svgContent = new XMLSerializer().serializeToString($('svg')[0]);
        var rep = '<svg xmlns="http://www.w3.org/2000/svg" ';
        if (svgContent.substr(0,rep.length) != rep) {
            svgContent = svgContent.replace('<svg ', rep);    
        }
        
        var form = $('#svgChartPseudoForm');
        form.find('.type').val(type);
        form.find('.svg').val(svgContent);
        form.attr('action', Settings.REST_URL + this.workspace.query.url() + escape("/../../export/saiku/chart"));
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
        this.block_ui();
        this.process_data({ data: this.workspace.query.result.lastresult() });
    },

    chart_editor: function() {
		$('a#acharteditor').click();
		return true;
    },

    stackedBar: function() {
        var options = {
            stacked: true,
            type: "BarChart"
        };
        this.cccOptions = this.getQuickOptions(options);
        this.render_chart();
    },
    
    bar: function() {
        var options = {
            type: "BarChart"
        };
        this.cccOptions = this.getQuickOptions(options);
        this.render_chart();
        /*
        this.cccOptions.multiChartIndexes = [1];
        this.cccOptions.dataMeasuresInColumns = true;
        this.cccOptions.orientation = 'vertical';
        this.cccOptions.smallTitlePosition = 'left';
        //this.cccOptions.multiChartColumnsMax = 5;
        this.cccOptions.smallWidth = 300;
        this.cccOptions.smallHeight = 100;
        */
    },

    multiplebar: function() {
        var options = {
            type: "BarChart",
            multiChartIndexes: [1],
            dataMeasuresInColumns: true,
            orientation: "vertical",
            smallTitlePosition: "top",
            multiChartColumnsMax: Math.floor( this.cccOptions.width / 200),
            smallWidth: 200,
            smallHeight: 150

        };
        this.cccOptions = this.getQuickOptions(options);
        this.render_chart();
    },
    
    line: function() {
        var options = {
            type: "LineChart"
        };

        this.cccOptions = this.getQuickOptions(options);
        this.render_chart();
    },
    
    pie: function() {
        var options = {
            type: "PieChart",
            multiChartIndexes: [0] // ideally this would be chosen by the user (count, which)
        };
        this.cccOptions = this.getQuickOptions(options);
        this.render_chart();
    },

    heatgrid: function() {
        var options = {
            type: "HeatGridChart"
        };
        this.cccOptions = this.getQuickOptions(options);
        this.render_chart();
    },

    stackedBar100: function() {
        var options = {
            type: "NormalizedBarChart"
        };
        this.cccOptions = this.getQuickOptions(options);
        this.render_chart();
    },

    area: function() {
        var options = {
            type: "StackedAreaChart"
        };
        this.cccOptions = this.getQuickOptions(options);
        this.render_chart();
    },
    dot: function() {
        var options = {
            type: "DotChart"
        };
        this.cccOptions = this.getQuickOptions(options);
        this.render_chart();
    },
    waterfall: function() {
        var options = {
            type: "WaterfallChart"
        };
        this.cccOptions = this.getQuickOptions(options);
        this.render_chart();
    },

    // Default static style-sheet
    cccOptionsDefault: {
        Base: {
            animate: false,
            selectable: true,
            valuesVisible: false,
            legend:  true,
            legendPosition: "top",
            legendAlign: "right",
            legendSizeMax: "30%",
            axisSizeMax: "40%",
            plotFrameVisible : false,
            orthoAxisMinorTicks : false,
            colors: ["#4bb2c5", "#c5b47f", "#EAA228", "#579575", "#839557", "#958c12", "#953579", "#4b5de4", "#d8b83f", "#ff5800", "#0085cc"]
        },
        
        HeatGridChart: {
            orientation: "horizontal",
            useShapes: true,
            shape: "circle",
            nullShape: "cross",
            colorNormByCategory: false,
            sizeRole: "value",
            legend: false,
            hoverable: true,
            axisComposite: true,
            colors: ["red", "yellow", "lightgreen", "darkgreen"],
            xAxisSize: 130,
            yAxisSize: 130
        },
        
        WaterfallChart: {
            orientation: "horizontal"
        },
        
        PieChart: {
            multiChartColumnsMax: 3,
            multiChartMax: 30,
            smallTitleFont: "bold 14px sans-serif",
            valuesVisible: true,
            explodedSliceRadius: '5%',
            extensionPoints: {
                slice_innerRadiusEx: '40%'
            }
            //valuesLabelStyle: 'inside'
        },
        
        LineChart: {
            extensionPoints: {
                area_interpolate: "monotone", // cardinal
                line_interpolate: "monotone"
            }
        },
        
        StackedAreaChart: {
            extensionPoints: {
                area_interpolate: "monotone",
                line_interpolate: "monotone"
            }
        }
    },
    
    getQuickOptions: function(baseOptions) {
        var chartType = (baseOptions && baseOptions.type) || "BarChart";
        var workspaceResults = $(this.workspace.el).find(".workspace_results");
        
        var options = _.extend({
                type:   chartType,
                canvas: this.id,
                width:  workspaceResults.width() - 40,
                height: workspaceResults.height() - 40,
            },
            this.cccOptionsDefault.Base,
            this.cccOptionsDefault[chartType], // may be undefined
            baseOptions);
        
        if(this.data != null && this.data.resultset.length > 5) {
            if(options.type === "HeatGridChart") {
                options.xAxisSize = 150;
            } else if(options.orientation !== "horizontal") {
                options.extensionPoints = _.extend(Object.create(options.extensionPoints || {}),
                    {
                        xAxisLabel_textAngle: -Math.PI/2,
                        xAxisLabel_textAlign: "right",
                        xAxisLabel_textBaseline:  "middle"
                    });
            }
        }
        
        return options;
    },
    
    render_chart: function() {
        if (! $(this.workspace.querytoolbar.el).find('.render_chart').hasClass('on')) {
            return;
        }

        /* XXX - enable later
        var start = new Date().getTime();
        this.editor.chartDefinition = _.clone(this.cccOptions);
        this.editor.set_chart("pvc." + this.cccOptions.type);
        this.editor.render_chart_properties("pvc." + this.cccOptions.type, this.editor.chartDefinition);
        */

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
        Saiku.ui.unblock();
        //var end = new Date().getTime();
        //console.log("Duration: " + (end - start));

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

        if (typeof args.data == "undefined" || args.data == null || args.data.cellset == null ) {
            Saiku.ui.unblock();
            return false;
        }
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
            this.cccOptions = this.getQuickOptions(this.cccOptions);
            this.render_chart();
        } else {
            $(this.el).text("No results");
        }
        Saiku.ui.unblock();
    }
});



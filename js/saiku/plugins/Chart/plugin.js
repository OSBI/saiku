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
    initialize: function(args) {
        this.workspace = args.workspace;
        
        // Create a unique ID for use as the CSS selector
        this.id = _.uniqueId("chart_");
        $(this.el).attr({ id: this.id });
        
        // Bind table rendering to query result event
        _.bindAll(this, "render", "receive_data", "process_data", "show", 
            "setOptions");
        this.workspace.bind('query:result', this.receive_data);
        
        // Add chart button
        this.add_button();
        this.workspace.toolbar.chart = this.show;
        
        // Listen to adjust event and rerender chart
        this.workspace.bind('workspace:adjust', this.render);
        var chartoptions ="<div class='chart-switcher'>" +
                "<a class='type' href='#bar' class='i18n'>bar</a>" +
                "<a class='type' href='#stackedBar' class='i18n'>stacked bar</a>" +
                "<a class='type' href='#line' class='i18n'>line</a>" +
                "<a class='type' href='#pie' class='i18n'>pie</a>" +
                "<a class='type' href='#heatgrid' class='i18n'>heatgrid</a>";

        var exportoptions = "Export to: " +
                "<a class='export' href='#png' class='i18n'>PNG</a>, " +
                "<a class='export' href='#pdf' class='i18n'>PDF</a>, " +
                "<a class='export' href='#tiff' class='i18n'>TIFF</a>, " +
                "<a class='export' href='#svg' class='i18n'>SVG</a>, " +
                "<a class='export' href='#jpg' class='i18n'>JPG</a>" +
                "<form id='svgChartPseudoForm' action='/saiku/svg' method='POST'>" +
                "<input type='hidden' name='type' class='type'/>" +
                "<input type='hidden' name='svg' class='svg'/>" +
                "</form>";

        var chartnav = (Settings.PLUGIN) ? chartoptions + "<div>" : chartoptions + exportoptions + "</div>";
        
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
                })
                .click(this.setOptions);
        this.nav.find('a.export').click(this.exportChart);

        // Append chart to workspace
        $(this.workspace.el).find('.workspace_results')
            .prepend($(this.el).hide())
            .prepend(this.nav.hide());
    },
    
    add_button: function() {
        var $chart_button = 
            $('<a href="#chart" class="chart button disabled_toolbar i18n" title="Toggle Chart"></a>')
            .css({  'background-image': "url('js/saiku/plugins/Chart/chart.png')",
                    'background-repeat':'no-repeat',
                    'background-position':'50% 50%'
                });

        var $chart_li = $('<li class="seperator"></li>').append($chart_button);
        $(this.workspace.toolbar.el).find("ul").append($chart_li);

    },
    
    show: function(event, ui) {
        $(this.workspace.el).find('.workspace_results table').toggle();
        $(this.el).toggle();
        $(this.nav).toggle();
        $(event.target).toggleClass('on');
        
        if ($(event.target).hasClass('on')) {
            this.process_data({ data: this.workspace.query.result.lastresult() });
            this.render();
        }
    },
    
    setOptions: function(event) {
        var type = $(event.target).attr('href').replace('#', '');
        try {
            this[type]();
        } catch (e) { }
        
        return false;
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

    stackedBar: function() {
        this.options.stacked = true;
        this.options.type = "BarChart";
        this.render();
    },
    
    bar: function() {
        this.options.stacked = false;
        this.options.type = "BarChart";
        this.render();
    },
    
    line: function() {
        this.options.stacked = false;
        this.options.type = "LineChart";
        this.render();
    },
    
    pie: function() {
        this.options.stacked = false;
        this.options.type = "PieChart";
        this.render();
    },

    heatgrid: function() {
        this.options.stacked = false;
        this.options.type = "HeatGridChart";
        this.render();
    },
    
    render: function() {
        if (! $(this.workspace.toolbar.el).find('.chart').hasClass('on')) {
            return;
        }
        
        var options = _.extend({        
            canvas: this.id,
            width: $(this.workspace.el).find('.workspace_results').width() - 40,
            height: $(this.workspace.el).find('.workspace_results').height() - 40,
            yAxisSize: 70,
            orientation: 'vertical',
            stacked: false,
            animate: false,
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
                    animate: false,
                    clickable: false,
                    orientation: "horizontal",
                    showValues: false,
                    showXScale: true,
                    xAxisPosition: "bottom",
                    showYScale: true,
                    panelSizeRatio: 0.8,
                    yAxisPosition: "left",
                    yAxisSize: 150,
                    minColor: "#FFFFFF",
                    maxColor: "green",
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
            this.render();
        } else {
            $(this.el).text("No results");
        }
    }
});

/**
 * Loads CCC and initializes chart plugin
 */
(function() {
    // Initialize CCC
    $.ajax({
        url: "js/saiku/plugins/Chart/ccc.js",
        dataType: "script",
        cache: true,
        success: function() {

            var initPlugin = function(session) {
                function new_workspace(args) {
                    // Add chart element
                    if (typeof args.workspace.chart == "undefined") {
                        args.workspace.chart = new Chart({ workspace: args.workspace });
                    } 
                }

                function clear_workspace(args) {
                    if (typeof args.workspace.chart != "undefined") {
                        $(args.workspace.chart.nav).hide();
                        $(args.workspace.chart.el).hide();
                        $(args.workspace.chart.el).parents().find('.workspace_results table').show();
                    }
                }
                
                // Attach chart to existing tabs
                for(var i = 0; i < Saiku.tabs._tabs.length; i++) {
                    var tab = Saiku.tabs._tabs[i];
                    new_workspace({
                        workspace: tab.content
                    });
                };
                
                // Attach chart to future tabs
                session.bind("workspace:new", new_workspace);
                session.bind("workspace:clear", clear_workspace);
            };

            if (typeof Saiku.session == "undefined") {
                Saiku.events.bind('session:new', initPlugin);
            } else {
                initPlugin(Saiku.session);
            }
        }
    });
}());

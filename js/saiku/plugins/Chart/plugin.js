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
        
        // Create navigation
        this.nav = $("<div class='chart-switcher'>" +
        		"<a href='#bar' class='i18n'>bar</a>" +
                "<a href='#stackedBar' class='i18n'>stacked bar</a>" +
        		"<a href='#line' class='i18n'>line</a>" +
        		"<a href='#pie' class='i18n'>pie</a>" +
                "<a href='#heatgrid' class='i18n'>heatgrid</a>" +
        		"</div>").css({
        		    'padding-bottom': '10px'
        		});
        this.nav.find('a').css({ 
                    color: '#666', 
                    'margin-right': '5px', 
                    'text-decoration': 'none', 
                    'border': '1px solid #ccc', 
                    padding: '5px' 
                })
                .click(this.setOptions);
    
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
            colors: ["#B40010", "#CCC8B4", "#DDB965", "#72839D", "#1D2D40"],
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
                    minColor: "#FEDFE1",
                    maxColor: "#F11929",
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
        return _.delay(this.process_data, 0, args);
    },
    
    process_data: function(args) {
        this.data = {};
        this.data.resultset = [];
        this.data.metadata = [];
        this.data.height = 0;
        this.data.width = 0;

        function makeSureUniqueLabels(resultset) {
            function appendUniqueCounter() {
                for(var i = 0; i < resultset.length; ++i) {
                    var record = resultset[i];
                    record[0] = record[0] + ' [' + (i + 1) + ']';
                }
            }

            var labelsSet = {};
            for(var i = 0; i < resultset.length; ++i) {
                var record = resultset[i];
                var label = record[0];
                if(labelsSet[label]) {
                    appendUniqueCounter();
                    return;
                } else {
                    labelsSet[label] = true;
                }
            }
        }

        var cellset = args.data.cellset;
        if (cellset && cellset.length > 0) {
            
            var lowest_level = 0;
        
            for (var row = 0; row < cellset.length; row++) {
                if (cellset[row][0].type == "ROW_HEADER_HEADER") {
                    this.data.metadata = [];
                    for (var field = 0; field < cellset[row].length; field++) {
                        if (cellset[row][field].type == "ROW_HEADER_HEADER") {
                            this.data.metadata.shift();
                            lowest_level = field;
                        }
                        
                        this.data.metadata.push({
                            colIndex: field,
                            colType: typeof(cellset[row + 1][field].value) !== "number" &&
                                isNaN(cellset[row + 1][field].value
                                .replace(/[^a-zA-Z 0-9.]+/g,'')) ? "String" : "Numeric",
                            colName: cellset[row][field].value
                        });
                    }
                } else if (cellset[row][0].value !== "") {
                    var record = [];
                    this.data.width = cellset[row].length;
                    var label = [];
                    for (var labelCol = lowest_level; labelCol >= 0; labelCol--) {
                        var lastKnownUpperLevelRow = row;
                        while(cellset[lastKnownUpperLevelRow] && cellset[lastKnownUpperLevelRow][labelCol].value === 'null') {
                            --lastKnownUpperLevelRow;
                        }
                        if(cellset[lastKnownUpperLevelRow]) {
                            label.push(cellset[lastKnownUpperLevelRow][labelCol].value);
                        }
                    }
                    record.push(label.join('/'));
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
            makeSureUniqueLabels(this.data.resultset);
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

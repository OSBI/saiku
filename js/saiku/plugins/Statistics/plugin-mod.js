/*
 * plugin.js
 * 
 * Copyright (c) 2011, OSBI Ltd. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301  USA
 */

/**
 * Renders a chart for each workspace
 */
var Statistics = Backbone.View.extend({
    initialize: function(args) {
        this.workspace = args.workspace;
        
        // Create a unique ID for use as the CSS selector
        this.id = _.uniqueId("statistics_");
        $(this.el).attr({ id: this.id });
        
        // Bind table rendering to query result event
        _.bindAll(this, "render", "receive_data", "process_data", "show", 
            "setOptions");
        this.workspace.bind('query:result', this.receive_data);
        
        // Add chart button
        this.add_button();
        this.workspace.toolbar.stats = this.show;
        
        // Listen to adjust event and rerender chart
        this.workspace.bind('workspace:adjust', this.render);
        // Append chart to workspace
        $(this.workspace.el).find('.workspace_results')
            .prepend($(this.el).hide())
            .prepend(this.nav.hide());
    },
    
    add_button: function() {
        var $stats_button = 
            $('<a href="#chart" class="chart button disabled_toolbar i18n" title="View Statistics"></a>')
            .css({ 'background': 
                "url('js/saiku/plugins/Chart/chart.png') 50% 50% no-repeat" });
        var $stats_li = $('<li class="seperator"></li>').append($stats_button);
        $(this.workspace.toolbar.el).find("ul").append($stats_li);
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
    
    render: function() {
        if (! $(this.workspace.toolbar.el).find('.stats').hasClass('on')) {
            return;
        }
        
        /*if (this.data.resultset.length > 5 ) {
            options.extensionPoints = {
                xAxisLabel_textAngle: -(Math.PI / 2),
                xAxisLabel_textAlign: "right",
                xAxisLabel_bottom: 10
            };
            
            options.xAxisSize = 100;
        }*/
        console.log(this.data)
        
        /*try {
            this.chart.render();
            Saiku.i18n.automatic_i18n();
        } catch (e) {
            $(this.el).text("Could not render chart");
        }*/
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
        
        if (args.data.cellset && args.data.cellset.length > 0) {
            
            var lowest_level = 0;
        
            for (var row = 0; row < args.data.cellset.length; row++) {
                if (args.data.cellset[row][0].type == "ROW_HEADER_HEADER") {
                    this.data.metadata = [];
                    for (var field = 0; field < args.data.cellset[row].length; field++) {
                        if (args.data.cellset[row][field].type == "ROW_HEADER_HEADER") {
                            this.data.metadata.shift();
                            lowest_level = field;
                        }
                        
                        this.data.metadata.push({
                            colIndex: field,
                            colType: typeof(args.data.cellset[row + 1][field].value) !== "number" &&
                                isNaN(args.data.cellset[row + 1][field].value
                                .replace(/[^a-zA-Z 0-9.]+/g,'')) ? "String" : "Numeric",
                            colName: args.data.cellset[row][field].value
                        });
                    }
                } else if (args.data.cellset[row][0].value !== "null" && args.data.cellset[row][0].value !== "") {
                    var record = [];
                    this.data.width = args.data.cellset[row].length;
                    for (var col = lowest_level; col < args.data.cellset[row].length; col++) {
                        var value = args.data.cellset[row][col].value;
                        // check if the resultset contains the raw value, if not try to parse the given value
                        if (args.data.cellset[row][col].properties.raw && args.data.cellset[row][col].properties.raw !== "null")
                        {
                            value = parseFloat(args.data.cellset[row][col].properties.raw);
                        } else if (typeof(args.data.cellset[row][col].value) !== "number" &&
                            parseFloat(args.data.cellset[row][col].value.replace(/[^a-zA-Z 0-9.]+/g,''))) 
                        {
                            value = parseFloat(args.data.cellset[row][col].value.replace(/[^a-zA-Z 0-9.]+/g,''));
                        }
                        if (col == lowest_level) {
                            value += " [" + row + "]";
                        }
                        record.push(value);
                    }
                    this.data.resultset.push(record);
                }
            }
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
    /*$.ajax({
        url: "js/saiku/plugins/Chart/ccc.js",
        dataType: "script",
        cache: true,
        success: function() {
            function new_workspace(args) {
                // Add chart element
                args.workspace.chart = new Statistics({ workspace: args.workspace });
            }
            
            // Attach chart to existing tabs
            for(var i = 0; i < Saiku.tabs._tabs.length; i++) {
                var tab = Saiku.tabs._tabs[i];
		console.log(tab.content)
                new_workspace({
                    workspace: tab.content
                });
            };
		console.log(Saiku.tabs._tabs)
            // Attach chart to future tabs
            Saiku.session.bind("workspace:new", new_workspace);
        }
    });*/
    Saiku.events.bind('session:new', function() {
        function new_workspace(args) {
            // Add chart element
            args.workspace.stats = new Statistics({ workspace: args.workspace });
        }
    console.log('eu hein!')
        Saiku.session.bind("workspace:new", new_workspace);
    });
}());

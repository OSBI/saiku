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
            .css({ 'background': 
                "url('js/saiku/plugins/Chart/chart.png') 50% 50% no-repeat" });
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
    
    render: function() {
        if (! $(this.workspace.toolbar.el).find('.chart').hasClass('on')) {
            return;
        }
        
        var options = _.extend({
            canvas: this.id,
            width: $(this.workspace.el).find('.workspace_results').width() - 20,
            height: $(this.workspace.el).find('.workspace_results').height() - 40,
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
        
        if (this.data.resultset.length > 5) {
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
                            colType: isNaN(args.data.cellset[row + 1][field].value
                                .replace(/[^a-zA-Z 0-9.]+/g,'')) ? "String" : "Numeric",
                            colName: args.data.cellset[row][field].value
                        });
                    }
                } else {
                    var record = [];
                    for (var col = lowest_level; col < args.data.cellset[row].length; col++) {
                        record.push(
                            parseFloat(args.data.cellset[row][col].value
                                .replace(/[^a-zA-Z 0-9.]+/g,'')) ?
                            parseFloat(args.data.cellset[row][col].value
                                .replace(/[^a-zA-Z 0-9.]+/g,'')) :
                            args.data.cellset[row][col].value
                        );
                    }
                    this.data.resultset.push(record);
                }
            }
            
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
            function new_workspace(args) {
                // Add chart element
                args.workspace.chart = new Chart({ workspace: args.workspace });
            }
            
            // Attach chart to existing tabs
            for(var i = 0; i < Saiku.tabs._tabs.length; i++) {
                var tab = Saiku.tabs._tabs[i];
                new_workspace({
                    workspace: tab.content
                });
            };
            
            // Attach chart to future tabs
            Saiku.session.bind("workspace:new", new_workspace);
        }
    });
}());
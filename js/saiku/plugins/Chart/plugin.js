var Chart = Backbone.View.extend({
    initialize: function(args) {
        this.workspace = args.workspace;
        
        // Create a unique ID for use as the CSS selector
        this.id = _.uniqueId("chart_");
        $(this.el).attr({ id: this.id });
        
        // Bind table rendering to query result event
        _.bindAll(this, "render", "receive_data", "process_data", "show");
        this.workspace.bind('query:result', this.receive_data);
        
        // Add chart button
        this.add_button();
        this.workspace.toolbar.chart = this.show;
        
        // Append chart to workspace
        $(this.workspace.el).find('.workspace_results')
            .prepend($(this.el).hide());
            
        // Listen to adjust event and rerender chart
        this.workspace.bind('workspace:adjust', this.render);
    },
    
    add_button: function() {
        var $chart_button = 
            $('<a href="#chart" class="chart button disabled_toolbar"></a>')
            .css({ 'background': 
                "url('js/saiku/plugins/Chart/chart.png') 50% 50% no-repeat" });
        var $chart_li = $('<li class="seperator"></li>').append($chart_button);
        $(this.workspace.toolbar.el).find("ul").append($chart_li);
    },
    
    show: function(event, ui) {
        $(this.workspace.el).find('.workspace_results table').toggle();
        $(this.el).toggle();
        $(event.target).toggleClass('on');
        
        if ($(event.target).hasClass('on')) {
            this.render();
        }
    },
    
    render: function() {
        if (! $(this.workspace.toolbar.el).find('.chart').hasClass('on')) {
            return;
        }
        
        var options = {
            canvas: this.id,
            width: $(this.workspace.el).find('.workspace_results').width() - 10,
            height: $(this.workspace.el).find('.workspace_results').height() - 10,
            orientation: 'vertical',
            stacked: true,
            animate: false,
            showValues: false,
            legend: true,
            legendPosition:"top",
            legendAlign: "right",
            colors: ["#B40010", "#CCC8B4", "#DDB965", "#72839D", "#1D2D40"]
        };
        
        if (this.data.resultset.length > 5) {
            options.extensionPoints = {
                xAxisLabel_textAngle: -(Math.PI / 2),
                xAxisLabel_textAlign: "right",
                xAxisLabel_bottom: 10
            };
            
            options.xAxisSize = 100;
        }
        
        this.chart = new pvc.BarChart(options);
        
        this.chart.setData(this.data, {
            crosstabMode: true,
            seriesInRows: false
        });
        
        try {
            this.chart.render();
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
        
        if (args.data.length > 0) {
            
            var lowest_level = 0;
        
            for (var row = 0; row < args.data.length; row++) {
                if (args.data[row][0].type == "ROW_HEADER_HEADER") {
                    this.data.metadata = [];
                    for (var field = 0; field < args.data[row].length; field++) {
                        if (args.data[row][field].type == "ROW_HEADER_HEADER") {
                            this.data.metadata.shift();
                            lowest_level = field;
                        }
                        
                        this.data.metadata.push({
                            colIndex: field,
                            colType: isNaN(args.data[row + 1][field].value
                                .replace(/[^a-zA-Z 0-9.]+/g,'')) ? "String" : "Numeric",
                            colName: args.data[row][field].value
                        });
                    }
                } else {
                    var record = [];
                    for (var col = lowest_level; col < args.data[row].length; col++) {
                        record.push(
                            parseFloat(args.data[row][col].value
                                .replace(/[^a-zA-Z 0-9.]+/g,'')) ?
                            parseFloat(args.data[row][col].value
                                .replace(/[^a-zA-Z 0-9.]+/g,'')) :
                            args.data[row][col].value
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
            _.each(Saiku.tabs._tabs, function(tab) {
                new_workspace({
                    workspace: tab.content
                });
            });
            
            // Attach chart to future tabs
            Saiku.session.bind("workspace:new", new_workspace);
        }
    });
}());
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
        if (! this.workspace.query) {
            this.workspace.bind('query:new', this.activate_button);
        } else {
            this.activate_button({ workspace: this });
        }
        
        // Append chart to workspace
        $(this.workspace.el).find('.workspace_results')
            .prepend($(this.el));
    },
    
    add_button: function() {
        var $chart_button = $('<a href="#chart" class="chart button disabled_toolbar"></a>')
            .css({ 'background': "url('js/saiku/plugins/Chart/chart.png') 50% 50% no-repeat" });
        var $chart_li = $('<li class="seperator"></li>').append($chart_button);
        $(this.workspace.toolbar.el).find("ul").append($chart_li);
    },
    
    activate_button: function(args) {
        $(args.workspace.el).find('.chart').removeClass('disabled_toolbar');
    },
    
    show: function(event, ui) {
        $(this.workspace.el).find('.workspace_results table').toggle();
        $(this.el).toggle();
        $(event.target).toggleClass('on');
    },
    
    render: function() { 
        $(this.el).css({
            width: $(this.workspace.el).find('.workspace_results').width() - 50,
            height: $(this.workspace.el).find('.workspace_results').height()
        }).html('');
        
        try {
            this.chart = new pvc.BarChart({
                canvas: this.id,
                width: $(this.workspace.el).find('.workspace_results').width() - 50,
                height: $(this.workspace.el).find('.workspace_results').height(),
                orientation: 'horizontal',
                stacked: true,
                animate: false,
                legend: true,
                legendPosition:"bottom"
            });
            
            this.chart.setData(this.data, {
                crosstabMode: true,
                seriesInRows: false
            });
            
            this.chart.render();
        } catch (e) {
            console.log(e);
        }
    },
    
    receive_data: function(args) {
        return _.delay(this.process_data, 0, args);
    },
    
    process_data: function(args) {
        this.data = {};
        this.data.resultset = [];
        this.data.metadata = [];
        
        for (var field = 1; field < args.data[0].length; field++) {
            this.data.metadata[field - 1] = {
                colIndex: field - 1,
                colType: String,
                colName: args.data[row][field].value
            };
        }
        
        if (args.data.length > 0) {
            for (var row = 1; row < args.data.length; row++) {
                var record = [];
                record.category = args.data[row][0].value;
                for (var col = 1; col < args.data[row].length; col++) {
                    record.push(parseFloat(args.data[row][col].value
                        .replace(/[^a-zA-Z 0-9.]+/g,'')));
                }
                this.data.push(record);
            }
            
            console.log(this.data);
            
            this.render();
        }
    }
});

(function() {
    // Initialize YUI
    $.getScript("js/saiku/plugins/Chart/ccc.js", function() {
        function new_workspace(args) {
            // Add chart element
            args.workspace.chart = new Chart({ workspace: args.workspace });
        }
        
        // Attach chart to existing tabs
        for (var i = 0; i < Saiku.tabs._tabs.length; i++) {
            new_workspace({ workspace: Saiku.tabs._tabs[i].content });
        }
        
        // Attach chart to future tabs
        Saiku.session.bind("workspace:new", new_workspace);
    });
}());
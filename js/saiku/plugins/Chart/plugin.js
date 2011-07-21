var Chart = Backbone.View.extend({
    initialize: function(args) {
        this.workspace = args.workspace;
        
        // Bind table rendering to query result event
        _.bindAll(this, "render", "process_data", "show");
        this.workspace.bind('query:result', this.render);
        
        // Add chart button
        this.add_button();
        this.workspace.toolbar.chart = this.show;
        this.workspace.bind('query:new', this.activate_button);
    },
    
    add_button: function() {
        var $chart_button = $('<a href="#chart" class="chart button disabled_toolbar"></a>')
            .css({ 'background': "url('/js/saiku/plugins/Chart/chart.png') 50% 50% no-repeat" });
        var $chart_li = $('<li class="seperator"></li>').append($chart_button);
        $(this.workspace.toolbar.el).find("ul").append($chart_li);
    },
    
    activate_button: function(args) {
        $(args.workspace.el).find('.chart').removeClass('disabled_toolbar');
    },
    
    show: function(event, ui) {
        var $results = $(this.workspace.el).find('.workspace_results');
        if ($(event.target).hasClass('on')) {
            // Show table again
            $results.children().detach();
            $results.append($(this.workspace.table.el));
            $(event.target).removeClass('on');
        } else {
            // Show chart
            $results.children().detach();
            $results.append($(this.el));
            $(event.target).addClass('on');
        }
    },
    
    render: function(args) {
        // Render the table without blocking the UI thread
        _.delay(this.process_data, 0, args);
    },
    
    process_data: function(args) {
        var chart = "chart";
        
        $(this.el).html(chart);
    }
});

(function() {
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
}());
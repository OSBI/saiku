var OpenQuery = Backbone.View.extend({
    className: 'tab_container',
    
    events: {
        'click .sidebar a': 'view_query',
        'click .workspace_toolbar a.open': 'open_query',
        'click .workspace_toolbar a.delete': 'delete_query'
    },
    
    template: function() {
        return _.template($("#template-open-dialog").html())();        
    },
    
    caption: function() {
        return "Repository";
    },
    
    render: function() {
        // Load template
        $(this.el).html(this.template());
        this.adjust();
        
        return this; 
    },
    
    initialize: function(args) {
        // Attach tab
        this.tab = args.tab;
        
        // Fetch queries
        this.repository = new Repository({}, { dialog: this });
        this.repository.fetch();
        
        // Adjust tab when selected
        this.tab.bind('tab:select', this.adjust);
        $(window).resize(this.adjust);
    },
    
    populate: function(response) {
        this.queries = {};
        var $ul = $(this.el).find('.sidebar ul').html('');
        for (var i = 0; i < response.length; i++) {
            var query = response[i];
            this.queries[query.name] = query;
            var $link = $("<a />").text(query.name)
                .attr({ href: "#" + query.name });
            $("<li />").append($link)
                .appendTo($ul);
        };
    },
    
    view_query: function(event) {
        var name = $(event.target).attr('href').replace('#', '');
        var query = this.queries[name];
        
        $(this.el).find('.workspace_toolbar').removeClass('hide');
        
        $results = $(this.el).find('.workspace_results')
            .html('<h3><strong>' + query.name + '</strong></h3>');
        var $properties = $('<ul id="query_info" />').appendTo($results);
        
        // Iterate through properties and show a key=>value set in the information pane
        for (property in query) {
            if (query.hasOwnProperty(property) && property != "name") {
                $properties.append($('<li />').html("<strong>" + 
                        property + "</strong> : " + query[property]));
            }
        }
        
        this.selected_query = new SavedQuery({ name: name });
        
        return false;
    },
    
    open_query: function(event) {
        this.selected_query.fetch();
        
        return false;
    },
    
    delete_query: function(event) {
        this.selected_query.destroy();
        
        return false;
    },
    
    adjust: function() {
        // Adjust the height of the separator
        $separator = $(this.el).find('.sidebar_separator');
        $separator.height($("body").height() - 87);
        $(this.el).find('.sidebar').height($("body").height() - 87);
        
        // Adjust the dimensions of the results window
        $(this.el).find('.workspace_results').css({
            width: $(document).width() - $(this.el).find('.sidebar').width() - 30,
            height: $(document).height() - $("#header").height() -
                $(this.el).find('.workspace_toolbar').height() - 
                $(this.el).find('.workspace_fields').height() - 40
        });
    },
    
    toggle_sidebar: function() {
        // Toggle sidebar
        $(this.el).find('.sidebar').toggleClass('hide');
        var new_margin = $(this.el).find('.sidebar').hasClass('hide') ?
                5 : 265;
        $(this.el).find('.workspace_inner').css({ 'margin-left': new_margin });
    }
});
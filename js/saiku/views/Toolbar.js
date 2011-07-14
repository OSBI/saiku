var Toolbar = Backbone.View.extend({
    tagName: "div",
    
    events: {
        'click #add_tab': 'add_tab',
        'click #open_query': 'open_query',
        'click #logout': 'logout',
        'click #about': 'about',
        'click #issue_tracker': 'issue_tracker'
    },
    
    template: function() {
        return _.template("<ul>" + 
                    "<li><a id='add_tab' href='#add_tab' " +
                    "   title='New query' class='new_tab i18n'></a></li>" +
                    "<li class='separator'>&nbsp;</li>" +
                    "<li><a id='open_query' href='#open_query' title='Open query' class='open_query i18n'></a></li>" + 
                    "<li class='separator'>&nbsp;</li>" +
                    "<li><a id='logout' href='#logout' title='Logout' class='logout i18n'></a></li>" +
                    "<li><a id='about' href='#about' title='About' class='about i18n'></a></li>" +
                    "<li class='separator'>&nbsp;</li>" +
                    "<li><a id='issue_tracker' href='#issue_tracker' title='Issue Tracker' class='bug i18n'></a></li>" +
                "</ul>" +
                "<h1 id='logo'><a href='http://www.analytical-labs.com/' title='Saiku - Next Generation Open Source Analytics'>Saiku</a></h1>"
            )(this);
    },
    
    initialize: function() {
        this.render();
    },
    
    render: function() {
        $(this.el).attr('id', 'toolbar')
            .html(this.template());
        return this;
    },
    
    /**
     * Add a new tab to the interface
     */
    add_tab: function() {
        Saiku.tabs.add(new Tab);
        return false;
    },
    
    /**
     * Open a query from the repository into a new tab
     */
    open_query: function() {
        return false;
    },
    
    /**
     * Clear the current session and show the login window
     */
    logout: function() {
        // FIXME - This is a hack (inherited from old UI)
        $('body').hide();
        localStorage.clear();
        location.reload(true);
        return false;
    },
    
    /**
     * Show the credits dialog
     */
    about: function() {
        (new AboutModal).render().open();
        return false;
    },
    
    /**
     * Go to the issue tracker
     */
    issue_tracker: function() {
        window.open('http://projects.analytical-labs.com/projects/saiku/issues/new');
        return false;
    }
});



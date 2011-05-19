/**
 * Controller
 * Handles interaction events
 */
var controller = {

    // Interaction event handlers        
    toolbar_click_handler : function($button) {
        try {
                controller[$button.attr('href').replace('#', '')]();
        } catch (e) {};
    },
    
    add_tab : function () {},
    open_query : function () {},
    delete_query : function () {},
    logout : function () {},
    issue_tracker : function() {},
    about : function() {}
    
};

// Initialize application
var saiku = new SaikuApp;
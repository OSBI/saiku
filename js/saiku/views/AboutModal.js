/**
 * The "about us" dialog
 */
var AboutModal = Modal.extend({
    initialize: function() {
        _.extend(this.options, {
            title: "About " + Settings.VERSION
        });
    },
    
    type: "info",
    
    message: Settings.VERSION + "<br>" + 
        "<a href='http://www.analytical-labs.com'>http://www.analytical-labs.com/</a>"
});
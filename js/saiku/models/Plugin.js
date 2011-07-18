/**
 * Asynchronously load all plugins after login
 */
var Plugin = Backbone.Model.extend({
    initialize: function() {        
        for (var i = 0; i < Settings.plugins.length; i++) {
            $.getScript("/js/saiku/plugins/" + Settings.plugins[i] + ".js");
        }
    }
});
/**
 * Asynchronously load all plugins after login
 */
var Plugin = Backbone.Model.extend({
    initialize: function() {        
        for (var i = 0; i < Settings.PLUGINS.length; i++) {
            $.getScript("/js/saiku/plugins/" + Settings.PLUGINS[i] + ".js");
        }
    }
});
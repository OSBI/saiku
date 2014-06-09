/**
 * Created by bugg on 30/04/14.
 */

var Plugin = Backbone.Model.extend({
   urlRoot: 'info'
});

var PluginCollection = Backbone.Collection.extend({
    model: Plugin
    , url: 'info'
});
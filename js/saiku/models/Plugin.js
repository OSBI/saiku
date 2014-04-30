/**
 * Created by bugg on 30/04/14.
 */

var Plugin = Backbone.Model.extend({
   urlRoot: Settings.REST_URL+'info'
});

var PluginCollection = Backbone.Collection.extend({
    model: Plugin
    , url: Settings.REST_URL+'info'
});
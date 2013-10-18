/*
var SaikuRendererRegistry = {

};

SaikuRendererRegistry.prototype.register = function(key, data, options) {
    if (this.hasOwnProperty(key)) {
        return new SaikuRendererRegistry[key](data, options);
    } else {
        throw("No renderer with name '" + key + "' registered!");
    }
};
*/

var SaikuRendererOptions = {
    mode: null,
    dataMode: null,
    htmlObject: null,
    width: null,
    height: null
};

var SaikuRenderer = function(data, options) {
    this._options = _.extend(SaikuRendererOptions, options);
    this._hasProcessed = false;
    if (Backbone) {
        _.extend(this, Backbone.Events);
    }
    if (data) {
        this._data = data;
        this.processData(data, options);
        this._hasProcessed = true;
    }

};

SaikuRenderer.prototype.render = function(data, options) {
    var r = null;
    if (Backbone) {
        this.trigger('render:start', this );
    }

    if (!this.hasProcessedData()) {
        this.processData(data, options);
    }
    r = this._render(data, options);
    if (Backbone) {
        this.trigger('render:end', this );
    }
    return r;
};

SaikuRenderer.prototype.processData = function(data, options) {
    this.trigger('processData:start', this );
    this._processData(data, options);
    this.trigger('processData:end', this );
};
SaikuRenderer.prototype.hasProcessedData = function() {
    return this._hasProcessed;
};


SaikuRenderer.prototype._render = function(data, options) {};
SaikuRenderer.prototype._processData = function(data, options) {};

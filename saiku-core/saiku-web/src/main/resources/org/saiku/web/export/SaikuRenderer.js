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
    if (typeof Backbone !== "undefined") {
        _.extend(this, Backbone.Events);
    }
    if (data) {
        this._data = data;
        this.processData(data, options);
        this._hasProcessed = true;
    }

};

SaikuRenderer.prototype.render = function(data, options) {
    if (typeof Backbone !== "undefined") {
        this.trigger('render:start', this );
    }

    if (!this.hasProcessedData()) {
        this.processData(data, options);
    }
    var r = this._render(data, options);
    if (typeof Backbone !== "undefined") {
        this.trigger('render:end', this );
    }
    return r;
};

SaikuRenderer.prototype.processData = function(data, options) {
    if (typeof Backbone !== "undefined") {
        this.trigger('processData:start', this );
    }
    this._processData(data, options);
    if (typeof Backbone !== "undefined") {
        this.trigger('processData:end', this );
    }
};
SaikuRenderer.prototype.hasProcessedData = function() {
    return this._hasProcessed;
};


SaikuRenderer.prototype._render = function(data, options) {};
SaikuRenderer.prototype._processData = function(data, options) {};


// Custom exceptions
function BadEventException() { }

/**
 * Controller which handles custom events for each tab
 * @param tab
 * @returns {Controller}
 */
function Controller() {
    this._tab = new Tab(this);
    this._data = {};
    
    _.extend(this, Backbone.Events);
}

/**
 * Get arbitrary data specific to this tab
 * @param key
 * @returns data
 */
Controller.prototype.get = function(key) {
    try {
        // Fire off event handler for retrieval of data
        this.trigger("get_" + key, this._data[key]);
    } catch(e) { }
    return this._data[key];
};

/**
 * Set arbitrary data specific to this tab
 * @param key
 * @param data
 * @returns none
 */
Controller.prototype.set = function(key, data) {
    var args = {
        data: data
    };
    
    try {
        // Fire off event handler for before storage of data
        this.trigger("pre_set_" + key, args);
    } catch(e) { }
    
    this._data[key] = args.data;
    
    try {
        // Fire off event handler for after storage of data
        this.trigger("post_set_" + key, args);
    } catch(e) { }
};
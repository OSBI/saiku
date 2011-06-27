// Custom exceptions
function BadEventException() { }

/**
 * Controller which handles custom events for each tab
 * @param tab
 * @returns {Controller}
 */
function Controller() {
    // Event bus which holds all listeners 
    this._event_listeners = {};
    this._tab = new Tab(this);
    this._data = {};
}

/**
 * Add a new event listener for this controller
 * @param event
 * @param callback
 */
Controller.prototype.listen = function(event, callback) {
    if (this._event_listeners[event] === undefined) {
        this._event_listeners[event] = [];
    }
    
    this._event_listeners[event].push(callback);
};

/**
 * Trigger all event listeners on an event
 * @param event
 * @param data
 */
Controller.prototype.trigger = function(event, data) {
    if (this._event_listeners[event] === undefined) {
        throw new BadEventException();
        return;
    } else {
        for (var i = 0; i < this._event_listeners[event].length; i++) {
            data = this._event_listeners[event][i](data);
        }
    }
    
    return data;
};

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
    try {
        // Fire off event handler for before storage of data
        data = this.trigger("pre_set_" + key, data);
    } catch(e) { }
    
    this._data[key] = data;
    
    try {
        // Fire off event handler for after storage of data
        this.trigger("post_set_" + key, data);
    } catch(e) { }
};
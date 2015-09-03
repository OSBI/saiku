/*
 *   Copyright 2015 OSBI Ltd
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

/**
 * Select Parameter
 *
 * @class DataSources
 */
var DataSourcesModal = Modal.extend({
    /**
     * Type name
     *
     * @property type
     * @type {String}
     * @private
     */
    type: 'data-sources',

    /**
     * Property with main template of modal
     *
     * @property message
     * @type {String}
     * @private
     */
    message: '<form class="form-group-inline">' +
                '<label for="data-sources">Select a data source:</label>' +
                '<select id="data-sources"></select>' +
             '</form>',

    /**
     * Events of buttons
     *
     * @property buttons
     * @type {Array}
     * @private
     */
    buttons: [
        { text: 'Save', method: 'save' },
        { text: 'Cancel', method: 'close' }
    ],

    /**
     * The events hash (or method) can be used to specify a set of DOM events 
     * that will be bound to methods on your View through delegateEvents
     * 
     * @property events
     * @type {Object}
     * @private
     */
    events: {
        'click .dialog_footer a' : 'call'
    },

    /**
     * The constructor of view, it will be called when the view is first created
     *
     * @constructor
     * @private
     * @param  {Object} args Attributes, events and others things
     */
    initialize: function(args) {
        // Initialize properties
        _.extend(this, args);
        this.options.title = 'Data Sources';
        var dataSources = new DataSources({}, { dialog: this });
        dataSources.fetch();
        this.bind('open');
    },

    /**
     * Template for create element <option>
     *
     * @method option_template
     * @private
     * @param  {Object} parameters Name parameter
     * @return {String}            HTML template
     */
    option_template: function(data) {
        return _.template(
            '<option value="">-- Select --</option>' +
            '<% _.each(obj, function(value) { %>' +
                '<option value="<%= value.name %>"><%= value.name %></option>' +
            '<% }); %>'
        )(data);
    },

    callback: function(data) {
        var $dataSources = this.option_template(data);
        this.dataSources = data;
        this.$el.find('#data-sources').append($dataSources);
        console.log(data);
    },

    save: function(event) {
        event.preventDefault();
    }
});
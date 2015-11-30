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
 * Class for get a parent member
 *
 * @class ParentMemberSelectorModal
 */
var ParentMemberSelectorModal = Modal.extend({

    /**
     * Type name
     *
     * @property type
     * @type {String}
     * @private
     */
	type: 'parent-member-selector',

    /**
     * Property with main template of modal
     *
     * @property template_modal
     * @type {String}
     * @private
     */
	template_modal: _.template(
        '<form class="form-group">' +
        	'<div class="group-elements" style="padding-top: 0;">' +
				'<nav class="breadcrumbs">' +
				'</nav>' +
                '<span class="loading i18n">Loading...</span>' +
			'</div>' +
			'<div class="group-elements">' +
				'<label>Selected Level: <span class="selected-level"></span></label>' +
			'</div>' +
			'<div class="group-elements">' +
				'<ul class="members-list">' +
                    '<li class="i18n">Loading...</li>' +
				'<ul>' +
			'</div>' +
			'<div class="group-elements">' +
				'<input type="search" id="auto-filter" results="5" placeholder="Autocomplete Filter">' +
			'</div>' +
        '</form>'
	),

    /**
     * Events of buttons
     *
     * @property buttons
     * @type {Array}
     * @private
     */
    buttons: [
        { text: 'Add', method: 'save' },
        { text: 'Clear', method: 'clear' },
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
        'click    .dialog_footer a' : 'call',
        'click    .crumb'           : 'fetch_crumb',
        'dblclick .member'          : 'drill_member',
        'keyup    #auto-filter'     : 'auto_filter'
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
        this.workspace = args.workspace;
        this.options.title = 'Parent Member Selector';

        Saiku.ui.block('<span class="i18n">Loading...</span>');

        this.levels;
        this.members;
        this.childMembers;
        this.breadcrumbs;
        this.uniqueName;

        var level = new Level({}, { 
            ui: this, 
            cube: this.cube, 
            dimension: this.dimension, 
            hierarchy: this.hierarchy 
        });

        level.fetch({
            success: this.get_levels
        });

        // Load template
        this.message = this.template_modal({});

        this.bind('open', function() {});
    },

    get_levels: function(model, response) {
        var levelMember;

        if (response) {
            model.ui.levels = response;
            model.ui.breadcrumbs = [model.ui.dimension, model.ui.hierarchy, response[0].name];
            model.ui.populate_breadcrumbs(model.ui.breadcrumbs);
            model.ui.$el.find('.dialog_footer').find('a[href="#clear"]').data('name', response[0].name);
            levelMember = new LevelMember({}, { 
                ui: model.ui, 
                cube: model.ui.cube, 
                dimension: model.ui.dimension, 
                hierarchy: model.ui.hierarchy, 
                level: response[0].name 
            });
            levelMember.fetch({
                success: model.ui.get_members
            });
        }
    },

    get_members: function(model, response) {
        if (response) {
            model.ui.members = response;
            model.ui.populate_members_list(model.ui.members);
        }
    },

    get_child_members: function(model, response) {
        var levelUniqueName;

        if (response && response.length > 0) {
            Saiku.ui.block('<span class="i18n">Loading...</span>');

            model.ui.childMembers = response;
            model.ui.populate_members_list(model.ui.childMembers);

            levelUniqueName = response[0].levelUniqueName.split('].[');
            levelUniqueName = _.last(levelUniqueName).replace(/[\[\]]/gi, '');

            model.ui.breadcrumbs.push(levelUniqueName);
            model.ui.breadcrumbs = _.uniq(model.ui.breadcrumbs);
            model.ui.uniqueName = model.uniqueName;

            var position = _.indexOf(model.ui.breadcrumbs, levelUniqueName);
            var len = model.ui.breadcrumbs.length;

            model.ui.breadcrumbs = _.initial(model.ui.breadcrumbs, (len - (position + 1)));

            model.ui.populate_breadcrumbs(model.ui.breadcrumbs);
        }
        else {
            Saiku.ui.unblock();
        }
    },

    drill_member: function(event) {
        event.preventDefault();

        var $currentTarget = $(event.currentTarget);
        var uniqueName = $currentTarget.data('uniqueName');
        var levelUniqueName = $currentTarget.data('levelUniqueName');

        this.$el.find('#auto-filter').val('');

        var levelChildMember = new LevelChildMember({}, { ui: this, cube: this.cube, uniqueName: uniqueName });
        levelChildMember.fetch({
            success: this.get_child_members
        });        
    },

    auto_filter: function(event) {
        var $currentTarget = $(event.currentTarget);
        var uniqueName = $currentTarget.val();
        
        var levelChildMember = new LevelChildMember({}, { ui: this, cube: this.cube, uniqueName: uniqueName });
        levelChildMember.fetch({
            success: this.get_child_members
        }); 
    },

    fetch_crumb: function(event) {
        event.preventDefault();

        var $currentTarget = $(event.currentTarget);
        var levelMember = new LevelMember({}, { 
            ui: this, 
            cube: this.cube, 
            dimension: this.dimension, 
            hierarchy: this.hierarchy, 
            level: $currentTarget.text() 
        });

        levelMember.fetch({
            success: this.get_members
        });

        this.$el.find('#auto-filter').val('');

        var len = this.breadcrumbs.length;

        this.breadcrumbs = _.initial(this.breadcrumbs, (len - (Number($currentTarget.data('position')) + 1)));
        this.populate_breadcrumbs(this.breadcrumbs);
    },

    clear: function(event) {
        event.preventDefault();

        var name = $(this.el).find('.dialog_footer').find('a[href="#clear"]').data('name');

        var levelMember = new LevelMember({}, { 
            ui: this, 
            cube: this.cube, 
            dimension: this.dimension, 
            hierarchy: this.hierarchy, 
            level: name 
        });

        levelMember.fetch({
            success: this.get_members
        });

        this.$el.find('#auto-filter').val('');

        var position = _.indexOf(this.breadcrumbs, name);
        var len = this.breadcrumbs.length;

        this.breadcrumbs = _.initial(this.breadcrumbs, (len - (position + 1)));

        this.populate_breadcrumbs(this.breadcrumbs);
    },

    populate_breadcrumbs: function(data) {
    	var $crumbs = [];

		for (var i = 0; i < data.length; i++) {
			if (i !== (data.length - 1)) {
				$crumbs.push('<a href="#" class="crumb" data-position="' + i + '">' + data[i] + '</a> &gt;');
			}
			else {
				$crumbs.push('<span class="last-crumb">' + data[i] + '</span>');
			}
		}

        Saiku.ui.unblock();

        this.$el.find('.loading').remove();
		this.$el.find('.breadcrumbs').empty();
        this.$el.find('.breadcrumbs').append($crumbs);
    },

    populate_members_list: function(data) {
    	var $members = [];

        this.$el.find('.members-list').empty();

		for (var i = 0; i < data.length; i++) {
			$members = $('<li />')
				.addClass('member')
                .data('caption', data[i].caption)
                .data('uniqueName', data[i].uniqueName)
                .data('levelUniqueName', data[i].levelUniqueName ? data[i].levelUniqueName : false)
				.text(data[i].name);
			
            this.$el.find('.members-list').append($members);
		}

        Saiku.ui.unblock();
    }
});

/*
 * Workspace.js
 * 
 * Copyright (c) 2011, OSBI Ltd. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301  USA
 */
/**
 * The analysis workspace
 */
var Workspace = Backbone.View.extend({
    className: 'tab_container',
    
    events: {
        'click .sidebar_separator': 'toggle_sidebar',
        'change .cubes': 'new_query',
        'drop': 'remove_dimension',
        'click .refresh_cubes' : 'refresh'
    },
    
    initialize: function(args) {
        // Maintain `this` in jQuery event handlers
        _.bindAll(this, "adjust", "toggle_sidebar", "prepare", "new_query", 
                "init_query", "update_caption", "populate_selections","refresh");
                
        // Attach an event bus to the workspace
        _.extend(this, Backbone.Events);
        this.loaded = false;
        this.bind('dimensions:loaded',this.populate_selections);

        // Generate toolbar and append to workspace
        this.toolbar = new WorkspaceToolbar({ workspace: this });
        this.toolbar.render();
        
        // Create drop zones
        this.drop_zones = new WorkspaceDropZone({ workspace: this });
        this.drop_zones.render();
        
        // Generate table
        this.table = new Table({ workspace: this });
        
        // Pull query from args
        if (args && args.query) {
            this.query = args.query;
            this.query.workspace = this;
            this.query.save({}, { success: this.init_query });            
        }
        // Flash cube navigation when rendered
        Saiku.session.bind('tab:add', this.prepare);
    },
    
    caption: function() {
        if (this.query && this.query.name) {
            return this.query.name;
        }
        
        return "Unsaved query (" + (Saiku.tabs.queryCount + 1) + ")";
    },
    
    template: function() {
        var template = $("#template-workspace").html() || "";
        return _.template(template)({
            cube_navigation: Saiku.session.sessionworkspace.cube_navigation
        });        
    },

    refresh: function() {
        Saiku.session.sessionworkspace.refresh();
    },
    
    render: function() {
        // Load template
        $(this.el).html(this.template());
        
        // Show toolbar
        $(this.el).find('.workspace_toolbar').append($(this.toolbar.el));
        
        // Show drop zones
        $(this.drop_zones.el)
            .insertAfter($(this.el).find('.workspace_toolbar'));
        
        // Activate sidebar for removing elements
        $(this.el).find('.sidebar')
            .droppable({
                accept: '.d_measure, .d_dimension'
            });
        
        // Add results table
        $(this.el).find('.workspace_results')
            .append($(this.table.el));
        
        // Adjust tab when selected
        this.tab.bind('tab:select', this.adjust);
        $(window).resize(this.adjust);
            
        // Fire off new workspace event
        Saiku.session.trigger('workspace:new', { workspace: this });

        return this; 
    },
    
    clear: function() {
        // Prepare the workspace for a new query
        $(this.el).find('.workspace_results table,.connectable')
            .html('');
            
        // Trigger clear event
        Saiku.session.trigger('workspace:clear', { workspace: this });

    },
    
    adjust: function() {
        // Adjust the height of the separator
        $separator = $(this.el).find('.sidebar_separator');
        var heightReduction = 87;
        if (Settings.PLUGIN == true || Settings.BIPLUGIN == true) {
            heightReduction = 2;
        }
        $separator.height($("body").height() - heightReduction);
        $(this.el).find('.sidebar').height($("body").height() - heightReduction);
        
        // Adjust the dimensions of the results window
        $(this.el).find('.workspace_results').css({
            height: $(document).height() - $("#header").height() -
                $(this.el).find('.workspace_toolbar').height() - 
                $(this.el).find('.workspace_fields').height() - 40
        });
        
        // Fire off the adjust event
        this.trigger('workspace:adjust', { workspace: this });
    },
    
    toggle_sidebar: function() {
        // Toggle sidebar
        $(this.el).find('.sidebar').toggleClass('hide');
        $(this.toolbar.el).find('.toggle_sidebar').toggleClass('on');
        var new_margin = $(this.el).find('.sidebar').hasClass('hide') ?
                5 : 265;
        $(this.el).find('.workspace_inner').css({ 'margin-left': new_margin });
    },
    
    prepare: function() {
        // Draw user's attention to cube navigation
        $(this.el).find('.cubes')
            .parent()
            .css({ backgroundColor: '#AC1614' })
            .delay(500)
            .animate({ backgroundColor: '#fff' }, 'slow');
    },
    
    new_query: function() {
        // Delete the existing query
        if (this.query) {
            this.query.destroy();
        }
        
        // Initialize the new query
        this.selected_cube = $(this.el).find('.cubes').val();
        var parsed_cube = this.selected_cube.split('/');
        var cube = parsed_cube[3];
        for (var i = 4; i < parsed_cube.length; i++) {
            cube += "/" + parsed_cube[i];
        }
        this.query = new Query({
            connection: parsed_cube[0],
            catalog: parsed_cube[1],
            schema: (parsed_cube[2] == "null" ? "" : parsed_cube[2]) ,
            cube: decodeURIComponent(cube)
        }, {
            workspace: this
        });
        
        // Save the query to the server and init the UI
        Saiku.session.trigger('workspace:clear', { workspace: this });
        this.query.save();
        this.init_query();
    },
    
    init_query: function() {
        if ((Settings.MODE == "view" || Settings.MODE == "table") && this.query) {
            this.query.run();
            return;
        }

        if (this.query.get('type') == "MDX") {
            $(this.drop_zones.el).remove();
            this.toolbar.switch_to_mdx();
            if (! $(this.el).find('.sidebar').hasClass('hide')) {
                this.toggle_sidebar();
            }
        }
        // Find the selected cube
        if (this.selected_cube === undefined) {
            var schema = this.query.get('schema');
            this.selected_cube = this.query.get('connection') + "/" + 
                this.query.get('catalog') + "/"
                + ((schema == "" || schema == null) ? "null" : schema) 
                + "/" + this.query.get('cube');
            $(this.el).find('.cubes')
                .val(this.selected_cube);
        }        
        // Clear workspace
        this.clear();
        
        if (this.selected_cube) {
            // Create new DimensionList and MeasureList
            this.dimension_list = new DimensionList({
                workspace: this,
                dimension: Saiku.session.sessionworkspace.dimensions[this.selected_cube]
            });        
            $(this.el).find('.dimension_tree').html('').append($(this.dimension_list.el));
            
            this.measure_list = new DimensionList({
                workspace: this,
                dimension: Saiku.session.sessionworkspace.measures[this.selected_cube]
            });
            $(this.el).find('.measure_tree').html('').append($(this.measure_list.el));
        } else {
            // Someone literally selected "Select a cube"
            $(this.el).find('.dimension_tree').html('');
            $(this.el).find('.measure_tree').html('');
            return;
        }

    },

    populate_selections: function(dimension_el) {

        if (this.other_dimension) {
        // Populate selections - trust me, this is prettier than it was :-/
        var axes = this.query ? this.query.get('axes') : false;
        if (axes) {
            for (var axis_iter = 0; axis_iter < axes.length; axis_iter++) {
                var axis = axes[axis_iter];
                var $axis = $(this.el).find('.' + 
                    axis.name.toLowerCase() + ' ul');
                for (var dim_iter = 0; dim_iter < axis.dimensionSelections.length; dim_iter++) {
                    var dimension = axis.dimensionSelections[dim_iter];
                    var levels = [];
                    var members = {};
                    for (var sel_iter = 0; sel_iter < dimension.selections.length; sel_iter++) {
                        var selection = dimension.selections[sel_iter];
                        
                        // Drag over dimensions and measures
                        var type, name;
                        if (selection.dimensionUniqueName == "Measures") {
                            type = "measure";
                            name = selection.uniqueName;
                        } else {
                            type = "dimension";
                            name = selection.levelUniqueName;
                        }
                            
                        if (levels.indexOf(name) === -1) {
                            var $dim = $(dimension_el)
                                .find('a[rel="' + name + '"]')
                                .parent();
                            
                            if (!$dim.html() || $dim.html() == null) {
                                $dim = $(this.other_dimension)
                                .find('a[rel="' + name + '"]')
                                .parent();
                            }
                            var $clone = $dim.clone()
                                .addClass('d_' + type)
                                .appendTo($axis);
                            
                            if (type == "dimension") {
                                $("<span />").addClass('sprite')
                                    .prependTo($clone);
                            }

                            if (type == "measure") {
                                $icon = $("<span />").addClass('sort');
                                var sort = false;
                                _.each(axes, function(i_axis) {
                                    if (i_axis.sortLiteral && i_axis.sortLiteral != null && i_axis.sortLiteral.indexOf(name) != -1) {
                                        $icon.addClass(i_axis.sortOrder);
                                        sort = true;
                                    }
                                });
                                if (!sort) {
                                    $icon.addClass('none');
                                }
                                
                                $icon.prependTo($clone);
                            }

                            
                            
                            $dim.css({fontWeight: "bold"})
                                .draggable('disable')
                                .parents('.parent_dimension')
                                .find('.folder_collapsed')
                                .css({fontWeight: "bold"}); 
                            levels.push(name);
                        }
                        
                        // FIXME - something needs to be done about selections here
                    }
                }
            }
            
            this.query.run(true);
        }
        
        // Make sure appropriate workspace buttons are enabled
        this.trigger('query:new', { workspace: this });
        
        // Update caption when saved
        this.query.bind('query:save', this.update_caption);
        } else {
            this.other_dimension = dimension_el;
        }

    },
    
    update_caption: function() {
        var caption = this.query.get('name');
        $(this.tab.el).find('a').html(caption);
    },
    
   
    
    remove_dimension: function(event, ui) {
        this.drop_zones.remove_dimension(event, ui);
    }
});

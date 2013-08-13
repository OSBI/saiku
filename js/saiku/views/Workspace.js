/*  
 *   Copyright 2012 OSBI Ltd
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
 * The analysis workspace
 */
var Workspace = Backbone.View.extend({
    className: 'tab_container',
    
    events: {
        'click .sidebar_separator': 'toggle_sidebar',
        'change .cubes': 'new_query',
        'drop .sidebar': 'remove_dimension',
        'drop .workspace_results': 'remove_dimension',
        'click .refresh_cubes' : 'refresh',
        'click .cancel' : 'cancel'
    },
    
    initialize: function(args) {
        // Maintain `this` in jQuery event handlers
        _.bindAll(this, "caption", "adjust", "toggle_sidebar", "prepare", "new_query", 
                "init_query", "update_caption", "populate_selections","refresh", "sync_query", "cancel", "cancelled", "no_results", "error");
                
        // Attach an event bus to the workspace
        _.extend(this, Backbone.Events);
        this.loaded = false;
        this.bind('dimensions:loaded',this.populate_selections);
        this.bind('query:result',this.render_result);

        // Generate toolbar and append to workspace
        this.toolbar = new WorkspaceToolbar({ workspace: this });
        this.toolbar.render();

        this.querytoolbar = new QueryToolbar({ workspace: this });
        this.querytoolbar.render();
        
        // Create drop zones
        this.drop_zones = new WorkspaceDropZone({ workspace: this });
        this.drop_zones.render();
        
        // Generate table
        this.table = new Table({ workspace: this });
        
        this.chart = new Chart({ workspace: this });
        // Pull query from args
        if (args && args.query) {
            this.query = args.query;
            this.query.workspace = this;
            this.query.save({}, { success: this.init_query });
        }

        // Flash cube navigation when rendered
        Saiku.session.bind('tab:add', this.prepare);
    },
    
    caption: function(increment) {
        if (this.query && this.query.name) {
            return this.query.name;
        } else if (this.query && this.query.get('name')) {
            return this.query.get('name');
        }
        if (increment) {
            Saiku.tabs.queryCount++;
        }
        return "<span class='i18n'>Unsaved query</span> (" + (Saiku.tabs.queryCount) + ")";
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
        
        this.processing = $(this.el).find('.query_processing');
        // Show toolbar
        $(this.el).find('.workspace_toolbar').append($(this.toolbar.el));
        
        // Show drop zones
        $(this.el).find('.workspace_editor').append($(this.drop_zones.el));

        $(this.el).find('.query_toolbar').append($(this.querytoolbar.el));
        
        // Activate sidebar for removing elements
        $(this.el).find('.sidebar')
            .droppable({
                accept: '.d_measure, .d_dimension'
            });

        $(this.el).find('.workspace_results')
            .droppable({
                accept: '.d_measure, .d_dimension'
            });
        
        // Add results table
        $(this.el).find('.workspace_results')
            .append($(this.table.el));
        
        this.chart.render_view();
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
        $(this.el).find('.workspace_results_info').empty();
        $(this.chart.el).find('div.canvas').empty();
        $(this.querytoolbar.el).find('ul.options a.on').removeClass('on');
        $(this.el).find('.fields_list[title="ROWS"] .limit').removeClass('on');
        $(this.el).find('.fields_list[title="COLUMNS"] .limit').removeClass('on');
        // Trigger clear event
        Saiku.session.trigger('workspace:clear', { workspace: this });

    },
    
    adjust: function() {
        // Adjust the height of the separator
        $separator = $(this.el).find('.sidebar_separator');
        var heightReduction = 87;
        if (Settings.PLUGIN == true || Settings.BIPLUGIN == true) {
            heightReduction = 2;
            if (Settings.MODE == 'table') {
                heightReduction = -5;
            }
        }
        if ($('#header').length == 0 || $('#header').is('hidden')) {
            heightReduction = 2;
        }
        $separator.height($("body").height() - heightReduction);
        $(this.el).find('.sidebar').height($("body").height() - heightReduction);

        $(this.querytoolbar.el).find('div').height($("body").height() - heightReduction - 10);
        
        // Adjust the dimensions of the results window
        var editorHeight = $(this.el).find('.workspace_editor').is(':hidden') ? 0 : $(this.el).find('.workspace_editor').height();
        var processingHeight = $(this.el).find('.query_processing').is(':hidden') ? 0 : $(this.el).find('.query_processing').height() + 62;

        $(this.el).find('.workspace_results').css({
            height: $("body").height() - heightReduction -
                $(this.el).find('.workspace_toolbar').height() - 
                $(this.el).find('.workspace_results_info').height() - 
                editorHeight - processingHeight - 20
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
            .delay(300)
            .animate({ backgroundColor: '#fff' }, 'slow');
    },
    
    new_query: function() {
        // Delete the existing query
        if (this.query) {
            this.query.destroy();
            this.query.clear();
            if (this.query.name) {
                this.query.name = undefined;
                this.update_caption(true);
            }
            this.query.name = undefined;
        }
        this.clear();
        this.processing.hide();
        Saiku.session.trigger('workspace:clear', { workspace: this });

        // Initialize the new query
        this.selected_cube = $(this.el).find('.cubes').val();
        if (!this.selected_cube) {
            // Someone literally selected "Select a cube"
            $(this.el).find('.dimension_tree').html('');
            $(this.el).find('.measure_tree').html('');
            return;
        }
        var parsed_cube = this.selected_cube.split('/');
        var cube = parsed_cube[3];
        for (var i = 4; i < parsed_cube.length; i++) {
            cube += "/" + parsed_cube[i];
        }
        this.query = new Query({
            connection: parsed_cube[0],
            catalog: parsed_cube[1],
            schema: (parsed_cube[2] == "null" ? "" : parsed_cube[2]) ,
            cube: decodeURIComponent(cube),
            formatter: Settings.CELLSET_FORMATTER
        }, {
            workspace: this
        });
        
        // Save the query to the server and init the UI
        this.query.save({},{ async: false });
        this.init_query();
    },
    
    init_query: function(isNew) {
        try 
        {
            var properties = this.query.properties ? this.query.properties.properties : {} ;
            var renderMode =  ('RENDER_MODE' in Settings) ? Settings.RENDER_MODE
                                    : ('saiku.ui.render.mode' in properties) ? properties['saiku.ui.render.mode'] 
                                    : null;
            var renderType =  ('RENDER_TYPE' in Settings) ? Settings.RENDER_TYPE
                                    : ('saiku.ui.render.type' in properties) ? properties['saiku.ui.render.type'] 
                                    : null;
            
            if (typeof renderMode != "undefined" && renderMode != null) {
                this.querytoolbar.switch_render(renderMode);
            }

            if ('chart' == renderMode && renderType in this.chart ) {
                this.chart[renderType]();
                $(this.chart.el).find('div').hide();
                $(this.querytoolbar.el).find('ul.chart [href="#' + renderType+ '"]').parent().siblings().find('.on').removeClass('on');
                $(this.querytoolbar.el).find('ul.chart [href="#' + renderType+ '"]').addClass('on');


            } else if ('table' == renderMode && renderType in this.querytoolbar) {
                this.querytoolbar.render_mode = "table";
                this.querytoolbar.spark_mode = renderType;
                $(this.querytoolbar.el).find('ul.table a.' + renderType).addClass('on');
            }
        } catch (e) {
                if (typeof console != "undefined") {
                    console.log(e);
                }
        }

        if ((Settings.MODE == "table") && this.query) {
            this.query.run(true);
            return;
        }

        if (this.query.get('type') == "MDX") {
            this.query.set({ formatter : "flat"});
            if (! $(this.el).find('.sidebar').hasClass('hide')) {
                this.toggle_sidebar();
            }            
            $(this.el).find('.workspace_fields').addClass('hide')
            this.toolbar.switch_to_mdx();



        } else {
            $(this.el).find('.workspace_editor').removeClass('hide').show();
            $(this.el).find('.workspace_fields').removeClass('disabled').removeClass('hide');
            $(this.el).find('.workspace_editor .mdx_input').addClass('hide');
            $(this.el).find('.workspace_editor .editor_info').addClass('hide');
            $(this.toolbar.el).find('.auto, ,.toggle_fields, .query_scenario, .buckets, .non_empty, .swap_axis, .mdx, .switch_to_mdx').parent().show();
            $(this.el).find('.run').attr('href','#run_query');
        }
        this.adjust();
        if ((Settings.MODE == "view") && this.query) {
            $(this.toolbar.el).find('.switch_to_mdx, .new').parent().hide();
            this.query.run(true);
            return;
        }

        if (this.query.get('type') == "QM" && $(this.el).find('.sidebar').hasClass('hide') && (Settings.MODE != "table" || Settings.MODE != "view")) {
                this.toggle_sidebar();
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
        //this.clear();
        
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
        }

        // is this a new query?
        if (typeof isNew != "undefined") {
            this.query.run(true);
        }


    },

    sync_query: function(needFetch) {
        var self = this;
        var sync_ui = function() {
                
                if (!Settings.hasOwnProperty('MODE') || (Settings.MODE != "table" && Settings.MODE != "view")) {
                    $(self.el).find('.fields_list_body ul').empty();

                    $(self.dimension_list.el).find('.parent_dimension a.folder_collapsed').removeAttr('style');
                    
                    $(self.dimension_list.el).find('.parent_dimension ul li')
                        .draggable('enable')
                        .css({ fontWeight: 'normal' });

                    $(self.measure_list.el).find('a.measure').parent()
                        .draggable('enable')
                        .css({ fontWeight: 'normal' });

                    $(self.el).find('.fields_list[title="ROWS"] .limit').removeClass('on');
                    $(self.el).find('.fields_list[title="COLUMNS"] .limit').removeClass('on');


                    self.populate_selections(self.measure_list.el);
                    $(self.el).find('.fields_list_body ul li')
                        .removeClass('ui-draggable-disabled ui-state-disabled')
                        .css({ fontWeight: 'normal' });

                    $(self.el).find('.fields_list_body').each(function(index, element) {
                            $axis = $(element);
                            if ($axis.find('li').length == 0) {
                                $axis.siblings('.clear_axis').addClass('hide');
                            } else {
                                $axis.siblings('.clear_axis').removeClass('hide');
                            }
                    });
                }
                self.query.run();

        };
        if (typeof needFetch == "undefined") {
            sync_ui();
        } else {
            var formatter = self.query.get('formatter');
            self.query.clear();
            self.query.set({ 'formatter' : formatter });
            self.query.fetch({ success: sync_ui });
        }
    },

    populate_selections: function(dimension_el) {
        var self = this;

        if (this.other_dimension) {
        // Populate selections - trust me, this is prettier than it was :-/
        var axes = this.query ? this.query.get('axes') : false;
        if (axes) {
            for (var axis_iter = 0; axis_iter < axes.length; axis_iter++) {
                var axis = axes[axis_iter];
                var $axis = $(this.el).find('.' + 
                    axis.name.toLowerCase() + ' ul');
                if ((axis.filterCondition != null) 
                        || (axis.limitFunction && axis.limitFunction != null && axis.limitFunction != "")
                        || (axis.sortOrder != null)) 
                {
                    $axis.parent().siblings('.fields_list_header').addClass('on');
                }
                for (var dim_iter = 0; dim_iter < axis.dimensionSelections.length; dim_iter++) {
                    var dimension = axis.dimensionSelections[dim_iter];
                    var levels = [];
                    var members = {};

                    if (dimension.name != "Measures" && dimension.selections.length > 0) {
                        var ds = Saiku.session.sessionworkspace.dimensions[this.selected_cube].get('data');
                        var h = dimension.selections[0].hierarchyUniqueName;
                        _.each(ds, function(d) {
                            if (dimension.name == d.name) {
                                _.each(d.hierarchies, function(hierarchy) {
                                    if (hierarchy.uniqueName == h) {
                                        var levels = [];
                                        _.each(hierarchy.levels, function(level) {
                                            levels.push(level.uniqueName);
                                        });
                                        dimension.selections = _.sortBy(dimension.selections, function(selection) {
                                            return _.indexOf(levels, selection.levelUniqueName);
                                        }); 
                                    }
                                });
                            }
                        });
                    } else if (dimension.name == "Measures" && dimension.selections.length > 0) {
                        var ms = Saiku.session.sessionworkspace.measures[this.selected_cube].get('data');
                        var mlist = [];
                        _.each(ms, function(m) {
                            mlist.push(m.uniqueName);
                        });
                        dimension.selections = _.sortBy(dimension.selections, function(selection) {
                            return _.indexOf(mlist, selection.uniqueName);
                        }); 
                    }


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

                            var $dim = $(''); 

                            if (typeof dimension_el != "undefined" && (!$dim.html() || $dim.html() == null)) {
                                $dim = $(dimension_el)
                                .find('a[rel="' + name + '"]')
                                .parent();
                            }

                            if (typeof self.measure_list != "undefined" && (!$dim.html() || $dim.html() == null)) {
                                $dim = $(self.measure_list.el)
                                .find('a[rel="' + name + '"]')
                                .parent();
                            }
                            
                            if (typeof self.dimension_list != "undefined" && (!$dim.html() || $dim.html() == null)) {
                                $dim = $(self.dimension_list.el)
                                .find('a[rel="' + name + '"]')
                                .parent();
                            }


                            var $clone = $dim.clone()
                                .addClass('d_' + type)
                                .appendTo($axis);
                            
                            if (type == "dimension") {
                                $("<span />").addClass('sprite selections')
                                    .prependTo($clone);
                                $icon = $("<span />").addClass('sort');
                                var sort = false;
                                _.each(axes, function(i_axis) {
                                    if (i_axis.sortLiteral && i_axis.sortLiteral != null && i_axis.sortLiteral.indexOf(selection.hierarchyUniqueName) != -1) {
                                        $icon.addClass(i_axis.sortOrder);
                                        sort = true;
                                    }
                                });
                                if (!sort) {
                                    $icon.addClass('none');
                                }
                                
                                $icon.insertBefore($clone.find('span'));
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
                                
                                $icon.insertBefore($clone.find('a'));
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
        }
        
        // Make sure appropriate workspace buttons are enabled
        this.trigger('query:new', { workspace: this });
        
        // Update caption when saved
        this.query.bind('query:save', this.update_caption);
        } else {
            this.other_dimension = dimension_el;
        }

    },
    
    update_caption: function(increment) {
        var caption = this.caption(increment);
        this.tab.set_caption(caption);
    },
    
   
    
    remove_dimension: function(event, ui) {
        if (this.query.get('type') == "QM") {
            this.drop_zones.remove_dimension(event, ui);
        }
    },

    render_result: function(args) {

        $(this.el).find(".workspace_results_info").empty();

        if (args.data != null && args.data.error != null) {
            return this.error(args);
        }        
        // Check to see if there is data
        if (args.data == null || (args.data.cellset && args.data.cellset.length === 0)) {
            return this.no_results(args);
        }

        var cdate = new Date().getHours() + ":" + new Date().getMinutes();
        var runtime = args.data.runtime != null ? (args.data.runtime / 1000).toFixed(2) : "";
        /*
        var info = '<b>Time:</b> ' + cdate 
                + " &emsp;<b>Rows:</b> " + args.data.height 
                + " &emsp;<b>Columns:</b> " + args.data.width 
                + " &emsp;<b>Duration:</b> " + runtime + "s";
        */
        var info = '<b><span class="i18n">Info:</span></b> &nbsp;' + cdate 
                + "&emsp;/ &nbsp;" + args.data.width 
                + " x " + args.data.height 
                + "&nbsp; / &nbsp;" + runtime + "s";

        $(this.el).find(".workspace_results_info").html(info);
        this.adjust();
        return;
    },

    block: function(message) {
        if (isIE) {
            var $msg = $("<span>" + message + "</span>");
            $msg.find('.processing_image').removeClass('processing_image');
            Saiku.ui.block($msg.html());
        } else {
            $(this.el).block({ 
                message: '<span class="saiku_logo" style="float:left">&nbsp;&nbsp;</span> ' + message
            });
            Saiku.i18n.translate();
        }
    },

    unblock: function() {
        if (isIE) {
            Saiku.ui.unblock();
        } else {
            $(this.el).unblock();
        }
    },

    cancel: function(event) {
        var self = this;
        this.query.action.del("/result", {
            success: function() {
                self.cancelled();
            }
        });
    },
    
    cancelled: function(args) {
        this.processing.html('<span class="processing_image">&nbsp;&nbsp;</span> <span class="i18n">Canceling Query...</span>').show();
    },

    no_results: function(args) {
        this.processing.html('<span class="i18n">No Results</span>').show();
    },
    
    error: function(args) {
        this.processing.html(safe_tags_replace(args.data.error)).show();
    }
});

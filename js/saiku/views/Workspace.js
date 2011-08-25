/**
 * The analysis workspace
 */
var Workspace = Backbone.View.extend({
    className: 'tab_container',
    
    events: {
        'click .sidebar_separator': 'toggle_sidebar',
        'change .cubes': 'new_query',
        'drop': 'remove_dimension'
    },
    
    initialize: function(args) {
        // Maintain `this` in jQuery event handlers
        _.bindAll(this, "adjust", "toggle_sidebar", "prepare", "new_query", 
                "init_query", "update_caption", "select_dimension");
                
        // Attach an event bus to the workspace
        _.extend(this, Backbone.Events);
        
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
            cube_navigation: Saiku.session.cube_navigation
        });        
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
        this.trigger('workspace:clear');
    },
    
    adjust: function() {
        // Adjust the height of the separator
        $separator = $(this.el).find('.sidebar_separator');
        $separator.height($("body").height() - 87);
        $(this.el).find('.sidebar').height($("body").height() - 87);
        
        // Adjust the dimensions of the results window
        $(this.el).find('.workspace_results').css({
            width: $(document).width() - $(this.el).find('.sidebar').width() - 30,
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
        this.query = new Query({
            connection: parsed_cube[0],
            catalog: parsed_cube[1],
            schema: parsed_cube[2],
            cube: parsed_cube[3]
        }, {
            workspace: this
        });
        
        // Save the query to the server and init the UI
        this.query.save();
        this.init_query();
    },
    
    init_query: function() {
        // Find the selected cube
        if (this.selected_cube === undefined) {
            this.selected_cube = this.query.get('connection') + "/" + 
                this.query.get('catalog') + "/" + 
                this.query.get('schema') + "/" + this.query.get('cube');
            $(this.el).find('.cubes')
                .val(this.selected_cube);
        }
        
        // Clear workspace
        this.clear();
        
        if (this.selected_cube) {
            // Create new DimensionList and MeasureList
            this.dimension_list = new DimensionList({
                workspace: this,
                dimension: Saiku.session.dimensions[this.selected_cube]
            });        
            $(this.el).find('.dimension_tree').html('').append($(this.dimension_list.el));
            
            this.measure_list = new DimensionList({
                workspace: this,
                dimension: Saiku.session.measures[this.selected_cube]
            });
            $(this.el).find('.measure_tree').html('').append($(this.measure_list.el));
        } else {
            // Someone literally selected "Select a cube"
            $(this.el).find('.dimension_tree').html('');
            $(this.el).find('.measure_tree').html('');
            return;
        }
        
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
                            var $dim = $(this.el).find('.' + type + '_tree')
                                .find('a[title="' + name + '"]')
                                .parent();
                            var $clone = $dim.clone()
                                .addClass('d_' + type)
                                .appendTo($axis);
                            
                            if (type == "dimension") {
                                $("<span />").addClass('sprite')
                                    .prependTo($clone);
                            }
                            
                            $dim.css({fontWeight: "bold"})
                                .draggable('disable')                                    
                                .parents('.parent_dimension')
                                .find('.root')
                                .css({fontWeight: "bold"})
                                .draggable('disable'); 
                            levels.push(name);
                        }
                        
                        // FIXME - something needs to be done about selections here
                    }
                }
            }
            
            this.query.run();
        }
        
        // Add click handlers
        $(this.el).find('.sidebar a.dimension, .sidebar a.measure')
            .click(this.select_dimension);
        
        // Make sure appropriate workspace buttons are enabled
        this.trigger('query:new', { workspace: this });
        
        // Update caption when saved
        this.query.bind('query:save', this.update_caption);
    },
    
    update_caption: function() {
        var caption = this.query.get('name');
        $(this.tab.el).find('a').html(caption);
    },
    
    select_dimension: function(event, ui) {
        if ($(event.target).parent().hasClass('ui-state-disabled')) {
            return;
        }
        
        $axis = $(this.el).find(".columns ul li").length > 0 ?
            $(this.el).find(".rows ul") :
            $(this.el).find(".columns ul");
        $target = $(event.target).parent().clone()
            .appendTo($axis);
        this.drop_zones.select_dimension({
            target: $axis
        }, {
            item: $target
        });
        return false;
    },
    
    remove_dimension: function(event, ui) {
        this.drop_zones.remove_dimension(event, ui);
    }
});
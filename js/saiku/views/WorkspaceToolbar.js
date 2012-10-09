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
 * The workspace toolbar, and associated actions
 */
var WorkspaceToolbar = Backbone.View.extend({
    enabled: false,
    events: {
        'click a': 'call'
    },
    
    initialize: function(args) {
        // Keep track of parent workspace
        this.workspace = args.workspace;
        
        // Maintain `this` in callbacks
        _.bindAll(this, "call", "reflect_properties", "run_query",
            "swap_axes_on_dropzones", "display_drillthrough","clicked_cell_drillthrough_export",
            "clicked_cell_drillthrough","activate_buttons", "switch_to_mdx","post_mdx_transform");
        
        // Redraw the toolbar to reflect properties
        this.workspace.bind('properties:loaded', this.reflect_properties);
        
        // Fire off workspace event
        this.workspace.trigger('workspace:toolbar:render', { 
            workspace: this.workspace
        });
        
        // Activate buttons when a new query is created or run
        this.workspace.bind('query:new', this.activate_buttons);
        this.workspace.bind('query:result', this.activate_buttons);
        
    },
    
    activate_buttons: function(args) {
        if (args != null && args.data && args.data.cellset && args.data.cellset.length > 0 ) {
            $(args.workspace.toolbar.el).find('.button')
                .removeClass('disabled_toolbar');            
            
            $(args.workspace.el).find("td.data").removeClass('cellhighlight').unbind('click');
            $(args.workspace.el).find(".table_mode").removeClass('on');

        } else {
            $(args.workspace.toolbar.el).find('.button')
                .addClass('disabled_toolbar').removeClass('on');
            $(args.workspace.toolbar.el)
                .find('.run,.auto,.non_empty,.toggle_fields,.toggle_sidebar,.switch_to_mdx')
                .removeClass('disabled_toolbar');
        }
        
        this.reflect_properties();

    },

    template: function() {
        var template = $("#template-workspace-toolbar").html() || "";
        return _.template(template)();
    },
    
    render: function() {
        $(this.el).html(this.template());
        
        return this; 
    },
    
    call: function(event) {
        // Determine callback
        var callback = event.target.hash.replace('#', '');
        
        // Attempt to call callback
        if (! $(event.target).hasClass('disabled_toolbar') && this[callback]) {
            this[callback](event);
        }
        
        return false;
    },

    reflect_properties: function() {
        var properties = this.workspace.query.properties ?
            this.workspace.query.properties.properties : Settings.QUERY_PROPERTIES;

        // Set properties appropriately
        if (properties['saiku.olap.query.nonempty'] === 'true') {
            $(this.el).find('.non_empty').addClass('on');
        }
        if (properties['saiku.olap.query.automatic_execution'] === 'true') {
            $(this.el).find('.auto').addClass('on');
        }
        
        if (properties['saiku.olap.query.drillthrough'] !== 'true') {
            $(this.el).find('.drillthrough, .drillthrough_export').addClass('disabled_toolbar');
        } else {
            $(this.el).find('.non_empty').removeClass('disabled_toolbar');
        }

        if (properties['org.saiku.query.explain'] !== 'true') {
            $(this.el).find('.explain_query').addClass('disabled_toolbar');
        }

        if (properties['org.saiku.connection.scenario'] !== 'true') {
            $(this.el).find('.query_scenario').addClass('disabled_toolbar');
        } else {
            $(this.el).find('.query_scenario').removeClass('disabled_toolbar');
            $(this.el).find('.drillthrough, .drillthrough_export').addClass('disabled_toolbar');
        }

        if (this.workspace.query.get('formatter') !== "undefined" && this.workspace.query.get('formatter') == "flattened") {
            if (! $(this.el).find('.group_parents').hasClass('on')) {
                $(this.el).find('.group_parents').addClass('on');
            }
        }
        

    },
    
    save_query: function(event) {
        if (this.workspace.query) {
            (new SaveQuery({ query: this.workspace.query })).render().open();
        }
    },
    
    run_query: function(event) {
        this.workspace.query.run(true);
    },
    
    automatic_execution: function(event) {
        // Change property
        this.workspace.query.properties
            .toggle('saiku.olap.query.automatic_execution').update();
        
        // Toggle state of button
        $(event.target).toggleClass('on');
    },
    
    toggle_fields: function(event) {
        $(this.workspace.el).find('.workspace_fields').toggle();
    },
    
    toggle_sidebar: function() {
        this.workspace.toggle_sidebar();
    },
    
    group_parents: function(event) {
        $(event.target).toggleClass('on');
        if ($(event.target).hasClass('on')) {
            this.workspace.query.set({formatter: "flattened"})
        } else {
            this.workspace.query.set({formatter: "flat"})
        }
        this.workspace.query.run();
    },

    non_empty: function(event) {
        // Change property
        this.workspace.query.properties
            .toggle('saiku.olap.query.nonempty')
            .toggle('saiku.olap.query.nonempty.rows')
            .toggle('saiku.olap.query.nonempty.columns')
            .update();
    
        // Toggle state of button
        $(event.target).toggleClass('on');
        
        // Run query
        this.workspace.query.run();
    },
    
    swap_axis: function(event) {
        // Swap axes
        $(this.workspace.el).find('.workspace_results table')
            .html('<tr><td>Swapping axes...</td></tr>');
        Saiku.ui.block('Swapping axes...');
        this.workspace.query.action.put("/swapaxes", { 
            success: this.swap_axes_on_dropzones
        });
    },
    

    check_modes: function(source) {
        if (typeof source === "undefined" || source == null)
            return;
        if (!$(source).hasClass('on')) {
            $(this.workspace.el).find("td.data").removeClass('cellhighlight').unbind('click');
            $(this.workspace.el).find(".table_mode").removeClass('on');
            this.workspace.query.run();
        } else {
            if ($(source).hasClass('drillthrough_export')) {
                $(this.workspace.el).find("td.data").addClass('cellhighlight').unbind('click').click(this.clicked_cell_drillthrough_export);
                $(this.workspace.el).find(".query_scenario, .drillthrough").removeClass('on');

            } else if ($(source).hasClass('drillthrough')) {
                $(this.workspace.el).find("td.data").addClass('cellhighlight').unbind('click').click(this.clicked_cell_drillthrough);
                $(this.workspace.el).find(".query_scenario, .drillthrough_export").removeClass('on');

            } else if ($(source).hasClass('query_scenario')) {
                this.workspace.query.scenario.activate();
                $(this.workspace.el).find(".drillthrough, .drillthrough_export").removeClass('on');
            }
        }

                
    },
    query_scenario: function(event) {
       $(event.target).toggleClass('on');
        this.check_modes($(event.target));        

    },

    drillthrough: function(event) {
       $(event.target).toggleClass('on');
        this.check_modes($(event.target));        
    },
    
    display_drillthrough: function(model, response) {
        this.workspace.table.render({ data: response });
        Saiku.ui.unblock();
    },

    export_drillthrough: function(event) {
        $(event.target).toggleClass('on');
        this.check_modes($(event.target));        
    },

    clicked_cell_drillthrough_export: function(event) {
        $target = $(event.target).hasClass('data') ?
            $(event.target).find('div') : $(event.target);
        var pos = $target.attr('rel');     
        (new DrillthroughModal({
            workspace: this.workspace,
            maxrows: 10000,
            title: "Drill-Through to CSV",
            action: "export",
            position: pos,
            query: this.workspace.query
        })).open();
   
    },

    clicked_cell_drillthrough: function(event) {
        $target = $(event.target).hasClass('data') ?
            $(event.target).find('div') : $(event.target);
        var pos = $target.attr('rel');
        (new DrillthroughModal({
            workspace: this.workspace,
            maxrows: 200,
            title: "Drill-Through",
            action: "table",
            success: this.display_drillthrough,
            position: pos,
            query: this.workspace.query
        })).open();
   
    },

    swap_axes_on_dropzones: function() {
        $columns = $(this.workspace.drop_zones.el).find('.columns')
            .children()
            .detach();
        $rows = $(this.workspace.drop_zones.el).find('.rows')
            .children()
            .detach();
            
        $(this.workspace.drop_zones.el).find('.columns').append($rows);
        $(this.workspace.drop_zones.el).find('.rows').append($columns);
        
        this.workspace.query.run();
        Saiku.ui.unblock();
    },
    
    show_mdx: function(event) {
        this.workspace.query.action.get("/mdx", { 
            success: function(model, response) {
                (new MDXModal({ mdx: response.mdx })).render().open();
            }
        });
    },
    
    export_xls: function(event) {
        window.location = Settings.REST_URL +
            Saiku.session.username + "/query/" + 
            this.workspace.query.id + "/export/xls";
    },
    
    export_csv: function(event) {
        window.location = Settings.REST_URL +
            Saiku.session.username + "/query/" + 
            this.workspace.query.id + "/export/csv";
    },

    switch_to_mdx: function(event) {
        $(this.workspace.el).find('.workspace_fields').hide();
        $(this.el).find('.auto, ,.toggle_fields, .query_scenario, .buckets, .non_empty, .swap_axis, .mdx, .switch_to_mdx').parent().hide();
        

        $(this.el).find('.run').attr('href','#run_mdx');
        $(this.el).find('.run, .save').removeClass('disabled_toolbar');

        if (Settings.MODE != "view" && Settings.MODE != "table") {
            $(this.workspace.el).find('.workspace_editor .mdx_input').removeClass('hide');
            $(this.workspace.el).find('.mdx_input').width($(this.el).width()-20);
        }



        if (this.workspace.dimension_list && this.workspace.measure_list) {
            $(this.workspace.dimension_list.el).find('ul li a').css({fontWeight: "normal"});
            $(this.workspace.measure_list.el).find('ul li a').css({fontWeight: "normal"});
            $(this.workspace.dimension_list.el).find('.measure,.dimension').parent('li').draggable('enable');
            $(this.workspace.measure_list.el).find('.measure,.dimension').parent('li').draggable('enable');
        }
        this.activate_buttons({ workspace: this.workspace });
        $(this.workspace.toolbar.el)
                .find('.run')
                .removeClass('disabled_toolbar');

        $(this.workspace.table.el).empty();
        this.workspace.adjust();
        this.post_mdx_transform();

    },

    post_mdx_transform: function() {
        var self = this;

        var transformed = function() {
            self.workspace.query.set({type:'MDX', formatter: "flat" });
            $(self.el).find('.group_parents').removeClass('on');
        };

        this.workspace.query.action.get("/mdx", { 
            success: function(model, response) {
                $(self.workspace.el).find(".mdx_input").val(response.mdx);
                self.workspace.query.action.post("/qm2mdx", { success: transformed } );

            }
        });

    },

    run_mdx: function(event) {
        var mdx = $(this.workspace.el).find(".mdx_input").val();
        this.workspace.query.run(true, mdx);
    },

    explain_query: function(event) {
        var self = this;
        var explained = function(model, args) {

            var explainPlan = "<textarea style='width: " + ($("body").width() - 165) + "px;height:" + ($("body").height() - 175) + "px;'>";
            if (args != null && args.error != null) {
                explainPlan += args.error;
            } else if (args.cellset && args.cellset.length === 0) {
                explainPlan += "Empty explain plan!";
            } else {
                explainPlan += args.cellset[1][0].value;
            }
            explainPlan += "</textarea>";

            Saiku.ui.unblock();
            var html =  explainPlan;
            var html = '<div id="fancy_results" class="workspace_results" style="overflow:visible"><table>' 
                    + "<tr><th clas='row_header'>Explain Plan</th></tr>"
                    + "<tr><td>" + explainPlan + "</td></tr>"
                    + '</table></div>';

            $.fancybox(html
                ,
                {
                'autoDimensions'    : false,
                'autoScale'         : false,
                'height'            :  ($("body").height() - 100),
                'width'             :  ($("body").width() - 100),
                'transitionIn'      : 'none',
                'transitionOut'     : 'none'
                }
            );
        };

        self.workspace.query.action.get("/explain", { success: explained } );

        return false;

    }
});

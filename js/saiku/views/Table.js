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
 * Class which handles table rendering of resultsets
 */
var Table = Backbone.View.extend({
    tagName: "table",

    events: {
        'click th.row' : 'clicked_cell',
        'click th.col' : 'clicked_cell'
    },

    initialize: function(args) {
        this.workspace = args.workspace;
        this.renderer = new SaikuTableRenderer();

        // Bind table rendering to query result event
        _.bindAll(this, "render", "process_data");
        this.workspace.bind('query:result', this.render);
    },
    
    clicked_cell: function(event) {
        var self = this;
        
        if (this.workspace.query.get('type') != 'QM' || Settings.MODE == "table") {
            return false;
        }

        var $target = ($(event.target).hasClass('row') || $(event.target).hasClass('col') ) ?
            $(event.target).find('div') : $(event.target);
        
    var $body = $(document);
    $.contextMenu('destroy', '.row, .col');
    $.contextMenu({
        appendTo: $target,
        selector: '.row, .col', 
        ignoreRightClick: true,
         build: function($trigger, e) {
            $target = $(e.currentTarget).find('div');
            var axis = $(e.currentTarget).hasClass('rows') ? "ROWS" : "COLUMNS"
            var pos = $target.attr('rel').split(':');
            var row = parseInt(pos[0])
            var col = parseInt(pos[1])
            var cell = self.workspace.query.result.lastresult().cellset[row][col];
            var query = self.workspace.query;
            var schema = query.get('schema');
            var cube = query.get('connection') + "/" + 
                query.get('catalog') + "/"
                + ((schema == "" || schema == null) ? "null" : schema) 
                + "/" + query.get('cube');

            var d = cell.properties.dimension;
            var h = cell.properties.hierarchy;
            var l = cell.properties.level;

            var keep_payload = JSON.stringify(
                {
                    "hierarchy"     :  h,
                    "uniquename"    : l,
                    "type"          : "level",
                    "action"        : "delete"
                }) 
            + "," +JSON.stringify(
                {
                    "hierarchy"     :  h,
                    "uniquename"    : cell.properties.uniquename,
                    "type"          : "member",
                    "action"        : "add"
                }       
            );

            var children_payload = cell.properties.uniquename;

            var levels = [];
            var items = {};
            var dimensions = Saiku.session.sessionworkspace.dimensions[cube].get('data');
            if (typeof dimensions == "undefined") {
                Saiku.session.sessionworkspace.dimensions[cube].fetch({async : false});
                dimensions = Saiku.session.sessionworkspace.dimensions[cube].get('data');
            }
            var dimsel = {};
            var used_levels = [];

            self.workspace.query.action.get("/axis/" + axis + "/dimension/" + encodeURIComponent(d), { 
                        success: function(response, model) {
                            dimsel = model;
                        },
                        async: false
            });

            _.each(dimsel.selections, function(selection) {
                if(_.indexOf(used_levels, selection.levelUniqueName) == -1)
                    used_levels.push(selection.levelUniqueName);

            });

            _.each(dimensions, function(dimension) {
                if (dimension.name == d) {
                    _.each(dimension.hierarchies, function(hierarchy) {
                        if (hierarchy.uniqueName == h) {
                            _.each(hierarchy.levels, function(level) {
                                items[level.name] = {
                                    name: level.caption,
                                    payload: JSON.stringify({
                                        "hierarchy"     : h,
                                        uniquename    : level.uniqueName,
                                        type          : "level",
                                        action        : "add"
                                    })
                                };
                                if(_.indexOf(used_levels, level.uniqueName) > -1) {
                                    items[level.name].disabled = true;
                                    items["remove-" + level.name] = {
                                        name: level.caption,
                                        payload: JSON.stringify({
                                            "hierarchy"     :  h,
                                            uniquename    : level.uniqueName,
                                            type          : "level",
                                            action        : "delete"
                                        })
                                    };
                                    
                                }
                                items["keep-" + level.name] = items[level.name];
                                items["include-" + level.name] = JSON.parse(JSON.stringify(items[level.name]));
                                items["keep-" + level.name].payload = keep_payload + "," + items[level.name].payload;
                            });
                        }
                    });
                }
            });
            items["keeponly"] = { payload: keep_payload }
            items["getchildren"] = { payload: children_payload }
            

            
            var lvlitems = function(prefix) {
                var ritems = {};
                for (key in items) {
                    if (prefix != null && prefix.length < key.length && key.substr(0, prefix.length) == prefix) {
                            ritems[key] = items[key];
                    }
                }
                return ritems;
            }

            var member = $target.html();

            var citems = {
                    "name" : {name: "<b>" + member + "</b>", disabled: true },
                    "sep1": "---------",
                    "keeponly": {name: "Keep Only", payload: keep_payload }
            };
            if (d != "Measures") {
                citems["getchildren"] = {name: "Show Children", payload: children_payload }
                citems["fold1key"] = {
                        name: "Include Level",
                        items: lvlitems("include-")
                    };
                citems["fold2key"] = {
                        name: "Keep and Include Level",
                        items: lvlitems("keep-")
                    };
                citems["fold3key"] = {
                        name: "Remove Level",
                        items: lvlitems("remove-")
                    };
            }
            return {
                callback: function(key, options) {
                    var url = '/axis/' + axis + '/dimension/' + encodeURIComponent(d);
                    var children = false;
                    if (key.indexOf("children") > 0) {
                        url = '/axis/' + axis + '/dimension/' + encodeURIComponent(d) + "/children";
                        children = true;
                    }
                    if (children) {
                        self.workspace.query.set({ 'formatter' : 'flat' });
                    }
                    self.workspace.query.action.put(url, { success: self.workspace.sync_query,
                        dataType: "text",
                        data: children ?
                            {
                                member: items[key].payload
                            }
                            :
                            {
                                selections: "[" + items[key].payload + "]"
                            }
                    });
                    
                },
                items: citems
            } 
        }
    });
    $target.contextMenu();


    },


    render: function(args, block) {

        if (typeof args == "undefined" || typeof args.data == "undefined" || 
            ($(this.workspace.el).is(':visible') && !$(this.el).is(':visible'))) {
            return;
        }

        if (args.data != null && args.data.error != null) {
            return;
        }        
        // Check to see if there is data
        if (args.data == null || (args.data.cellset && args.data.cellset.length === 0)) {
            return;
        }

        $(this.el).html('<tr><td>Rendering ' + args.data.width + ' columns and ' + args.data.height + ' rows...</td></tr>');

        // Render the table without blocking the UI thread
        if (block === true) {
            this.process_data(args.data);
        } else {
            _.delay(this.process_data, 0, args.data);
        }

    },

    process_data: function(data) {
        
        this.workspace.processing.hide();
        this.workspace.adjust();
        // Append the table
        var contents = this.renderer.render(data);
        $(this.el).html(contents);
        this.post_process();


    },

    post_process: function() {
        if (this.workspace.query.get('type') == 'QM' && Settings.MODE != "view") {
            $(this.el).find('th.row, th.col').addClass('headerhighlight');
        }
        this.workspace.trigger('table:rendered', this);
    }
});

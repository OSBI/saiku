/*
 * Table.js
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
 * Class which handles table rendering of resultsets
 */
var Table = Backbone.View.extend({
    tagName: "table",

    events: {
        'click .cancel': 'cancel',
        'click th.row' : 'clicked_cell',
        'click th.col' : 'clicked_cell'
    },

    initialize: function(args) {
        this.workspace = args.workspace;
        
        // Bind table rendering to query result event
        _.bindAll(this, "render", "process_data", "cancelled", "cancel");
        this.workspace.bind('query:result', this.render);
    },
    
    clicked_cell: function(event) {
        var self = this;
        
        if (this.workspace.query.get('type') != 'QM' || Settings.MODE == "view") {
            return false;
        }

        $target = ($(event.target).hasClass('row') || $(event.target).hasClass('col') ) ?
            $(event.target).find('div') : $(event.target);
        
    $body = $(document);
    $body.off('.contextMenu .contextMenuAutoHide');
    $('.context-menu-list').remove();
    $.contextMenu('destroy');
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
                    "hierarchy"     : "[" + h + "]",
                    "uniquename"    : l,
                    "type"          : "level",
                    "action"        : "delete"
                }) 
            + "," +JSON.stringify(
                {
                    "hierarchy"     : "[" + h + "]",
                    "uniquename"    : cell.properties.uniquename,
                    "type"          : "member",
                    "action"        : "add"
                }       
            );

            var levels = [];
            var items = {};
            var dimensions = Saiku.session.sessionworkspace.dimensions[cube].get('data');
            var dimsel = {};
            var used_levels = [];

            self.workspace.query.action.get("/axis/" + axis + "/dimension/" + d, { 
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
                        if (hierarchy.name == h) {
                            _.each(hierarchy.levels, function(level) {
                                items[level.name] = {
                                    name: level.name,
                                    payload: JSON.stringify({
                                        "hierarchy"     : "[" + h + "]",
                                        uniquename    : level.uniqueName,
                                        type          : "level",
                                        action        : "add"
                                    })
                                };
                                if(_.indexOf(used_levels, level.uniqueName) > -1) {
                                    items[level.name].disabled = true;
                                    items["remove-" + level.name] = {
                                        name: level.name,
                                        payload: JSON.stringify({
                                            "hierarchy"     : "[" + h + "]",
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
                    "keeponly": {name: "Keep Only", payload: keep_payload },
            };
            if (d != "Measures") {
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
                    self.workspace.query.action.put('/axis/' + axis + '/dimension/' + d, { 
                        success: function() {
                            self.workspace.query.clear();
                            self.workspace.query.fetch({ success: function() {
                                
                                $(self.workspace.el).find('.fields_list_body ul').empty();
                                $(self.workspace.dimension_list.el).find('.parent_dimension a.folder_collapsed').removeAttr('style');
                                
                                $(self.workspace.dimension_list.el).find('.parent_dimension ul li')
                                    .draggable('enable')
                                    .css({ fontWeight: 'normal' });

                                $(self.workspace.measure_list.el).find('a.measure').parent()
                                    .draggable('enable')
                                    .css({ fontWeight: 'normal' });

                                self.workspace.populate_selections(self.workspace.measure_list.el);
                                $(self.workspace.el).find('.fields_list_body ul li')
                                    .removeClass('ui-draggable-disabled ui-state-disabled')
                                    .css({ fontWeight: 'normal' });

                             }});

                        },
                        data: {
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
        if (args.data.error != null) {
            return this.error(args);
        }

        
        // Check to see if there is data
        if (args.data.cellset && args.data.cellset.length === 0) {
            return this.no_results(args);
        }
        
        // Clear the contents of the table
        $(this.el).html('<tr><td>Rendering ' + args.data.width + ' columns and ' + args.data.height + ' rows...</td></tr>');

        // Render the table without blocking the UI thread
        if (block === true) {
            this.process_data(args.data.cellset);
        } else {
            _.delay(this.process_data, 0, args.data.cellset);
        }

    },
    
    process_data: function(data) {
        var contents = "";
        var table = data ? data : [];
        for (var row = 0; row < table.length; row++) {
            contents += "<tr>";
            for (var col = 0; col < table[row].length; col++) {
                var header = data[row][col];
                
                // FIXME - this needs to be cleaned up
                
                // If the cell is a column header and is null (top left of table)
                if (header.type === "COLUMN_HEADER" && header.value === "null") {
                    contents += '<th class="all_null"><div>&nbsp;</div></th>';
                } // If the cell is a column header and isn't null (column header of table)
                else if (header.type === "COLUMN_HEADER") {
                    contents += '<th class="col"><div rel="' + row + ":" + col +'">' + header.value + '</div></th>';
                } // If the cell is a row header and is null (grouped row header)
                else if (header.type === "ROW_HEADER" && header.value === "null") {
                    contents += '<th class="row_null"><div>&nbsp;</div></th>';
                } // If the cell is a row header and isn't null (last row header)
                else if (header.type === "ROW_HEADER") {
                    contents += '<th class="row"><div rel="' + row + ":" + col +'">' + header.value + '</div></th>';
                }
                else if (header.type === "ROW_HEADER_HEADER") {
                    contents += '<th class="row_header"><div>' + header.value + '</div></th>';
                } // If the cell is a normal data cell
                else if (header.type === "DATA_CELL") {
                    contents += '<td class="data"><div alt="' + header.properties.raw + '" rel="' + header.properties.position + '">' + header.value + '</div></td>';
                }
            }
            contents += "</tr>";
        }
        
        // Append the table
        $(this.el).html(contents);
        this.post_process();
    },
    post_process: function() {
        if (this.workspace.query.get('type') == 'QM' && Settings.MODE != "view") {
            $(this.el).find('th.row, th.col').addClass('headerhighlight');
        }
    },
    cancel: function(event) {
        this.workspace.query.action.del("/result", {success: this.cancelled } );
    },
    
    cancelled: function(args) {
        $(this.el).html('<tr><td>No results</td></tr>');
    },

    no_results: function(args) {
        $(this.el).html('<tr><td>No results</td></tr>');
    },
    
    error: function(args) {
        $(this.el).html('<tr><td>' + args.data.error + '</td></tr>');
    }
});

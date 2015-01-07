/*
 * Copyright 2014 OSBI Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//goog.provide('saiku.views.AboutModal');

//goog.require('saiku.views.Modal');



/**
 * The "about us" dialog
 */
var OverwriteModal = Modal.extend({
    initialize: function(args) {
        _.extend(this.options, {
            title: "Warning "
        });

		this.queryname = args.name;
		this.queryfolder = args.foldername;
		this.parentobj = args.parent;

    },


	buttons: [
		{ text: "Yes", method: "save" },
		{ text: "No", method: "close"}
	],

    dummy: function() { return true;},

    type: "info",

    message: "Are you sure you want to overwrite the existing query?",

	save: function(){

		this.parentobj.save_remote(this.queryname, this.queryfolder, this.parentobj);
		this.close();
		this.parentobj.close();

	},
	close: function() {
		$(this.el).dialog('destroy').remove();
		$(this.el).remove();
		return false;
	}
});

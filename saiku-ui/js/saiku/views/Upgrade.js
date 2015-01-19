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
 * The global toolbar
 */
var Upgrade = Backbone.View.extend({
    tagName: "div",

    events: {
    },


    initialize: function(a, b) {

		this.workspace = a.workspace;

    },

	daydiff: function(first, second) {
	return Math.round((second-first)/(1000*60*60*24));
	},

    render: function() {

		var self = this;
		var license = new License();
		if(Settings.BIPLUGIN5){
			license.fetch_license('api/api/license', function (opt) {
				if (opt.status !== 'error' && opt.data.get("licenseType") != "trial") {
					return this;
				}
				else if(opt.status !== 'error' && opt.data.get("licenseType") === "trial"){
					var yourEpoch = parseFloat(opt.data.get("expiration"));
					var yourDate = new Date(yourEpoch);
					self.remainingdays = self.daydiff(new Date(), yourDate);


					$(self.workspace.el).find('.upgrade').append("<div><div id='uphead' class='upgradeheader'>You are using a Saiku Enterprise Trial license, you have "+ self.remainingdays+" days remaining until the license expires.</div>");
					return self;
				}
				else {
					$(self.workspace.el).find('.upgrade').append("<div><div id='uphead' class='upgradeheader'>You are using Saiku Community Edition, please consider upgrading to <a target='_blank' href='http://meteorite.bi'>Saiku Enterprise, or entering a sponsorship agreement with us</a> to support development. <a href='mailto:info@meteorite.bi?subject=Supporting Saiku'>info@meteorite.bi</a></div></div>");
					return self;
				}
			});
		}
		else {
			license.fetch_license('api/license/', function (opt) {
				if (opt.status !== 'error' && opt.data.get("licenseType") != "trial") {
					return this;
				}
				else if(opt.status !== 'error' && opt.data.get("licenseType") === "trial"){
					var yourEpoch = parseFloat(opt.data.get("expiration"));
					var yourDate = new Date(yourEpoch);

					self.remainingdays = self.daydiff(new Date(), yourDate);

					$(self.workspace.el).find('.upgrade').append("<div><div id='uphead' class='upgradeheader'>You are using a Saiku Enterprise Trial license, you have "+ self.remainingdays+" days remaining until the license expires.</div>");
					return self;
				}
				else {
					$(self.workspace.el).find('.upgrade').append("<div><div id='uphead' class='upgradeheader'>You are using Saiku Community Edition, please consider upgrading to <a target='_blank' href='http://meteorite.bi'>Saiku Enterprise, or entering a sponsorship agreement with us</a> to support development. <a href='mailto:info@meteorite.bi?subject=Supporting Saiku'>info@meteorite.bi</a></div></div>");
					return self;
				}
			});
		}








    },

    call: function(e) {
    }

});

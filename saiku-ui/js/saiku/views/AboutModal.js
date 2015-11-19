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
 * The "about us" dialog
 */
var AboutModal = Modal.extend({
    type: 'info',

    events: {
        'click a' : 'close'
    },

    message: Settings.VERSION + '<br>' +
        '<a href="http://saiku.meteorite.bi" target="_blank">http://saiku.meteorite.bi</a><br><br>' +
        '<h2 class="i18n">License Type</h2>'+
        '<span class="licensetype"/> - <span class="i18n">Expires:</span> <span class="licenseexpr"/><br/>'+
        '<span class="i18n">Number of users:</span> <span class="licenseuserlimit"/><br/>'+
        '<span class="i18n">Licensed to:</span> <span class="licensename"/> - <span class="licenseemail"/><br/>'+
        '<div id="licensetable">'+
        '<h2>Unlicenced User Quota</h2><br/>'+
        '<div class="table-wrapper">'+
        '<div class="table-scroll">'+
        '<table>'+
        '<thead>'+
        '<tr>'+
        '<th><span class="text">Username</span></th>'+
        '<th><span class="text">Logins Remaining</span></th>'+
        '</tr>'+
        '</thead>'+
        '<tbody>'+
        '<tr id="quotareplace"/>'+
        '</tbody>'+
        '</table>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '<strong><a href="http://www.meteorite.bi/saiku-pricing" class="i18n" target="_blank">Order more licenses' +
        ' here</a></strong><br/>'+
        'Powered by <img src="images/src/meteorite_free.png" width="20px"> <a href="http://www.meteorite.bi/services/consulting" target="_blank">www.meteorite.bi</a><br/>',

    initialize: function() {
        this.options.title = '<span class="i18n">About</span> ' + Settings.VERSION;
    },

    ObjectLength_Modern: function( object ) {
    return Object.keys(object).length;
    },

    ObjectLength_Legacy: function( object ) {
    var length = 0;
    for( var key in object ) {
        if( object.hasOwnProperty(key) ) {
            ++length;
        }
    }
    return length;
    },


    render: function() {
        $(this.el).html(this.template())
            .addClass("dialog_" + this.type)
            .dialog(this.options);

        var uiDialogTitle = $('.ui-dialog-title');
        uiDialogTitle.html(this.options.title);
        uiDialogTitle.addClass('i18n');
        Saiku.i18n.translate();
        license = new License();

        if(Settings.LICENSE.expiration != undefined) {
            yourEpoch = parseFloat(Settings.LICENSE.expiration);
            var yourDate = new Date(yourEpoch);
            $(this.el).find(".licenseexpr").text(yourDate.toLocaleDateString());
        }
        if(Settings.LICENSE.licenseType != undefined) {
            $(this.el).find(".licensetype").text(Settings.LICENSE.licenseType);
            $(this.el).find(".licensename").text(Settings.LICENSE.name);
            $(this.el).find(".licenseuserlimit").text(Settings.LICENSE.userLimit);
            $(this.el).find(".licenseemail").text(Settings.LICENSE.email);
        }
        else{
            $(this.el).find(".licensetype").text("Open Source License");
        }
        ObjectLength =
            Object.keys ? this.ObjectLength_Modern : this.ObjectLength_Legacy;

        if(Settings.LICENSEQUOTA != undefined && ObjectLength(Settings.LICENSEQUOTA) > 0 ) {
            var tbl_body = "";
            var odd_even = false;
            $.each(Settings.LICENSEQUOTA, function () {
                var tbl_row = "";
                $.each(this, function (k, v) {
                    tbl_row += "<td>" + v + "</td>";
                });
                tbl_body += "<tr class=\"" + ( odd_even ? "odd" : "even") + "\">" + tbl_row + "</tr>";
                odd_even = !odd_even;
            });

            $(this.el).find("#quotareplace").replaceWith(tbl_body);

        }
        else{
            $(this.el).find("#licensetable").hide();
        }

        return this;
    },

    close: function(event) {
        if (event.target.hash === '#close') {
            event.preventDefault();
        }
        this.$el.dialog('destroy').remove();
    }
});

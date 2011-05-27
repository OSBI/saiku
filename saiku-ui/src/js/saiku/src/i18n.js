/* Saiku UI -- a user interface for the Saiku Server
   Copyright (C) Paul Stoellberger, 2011.

   This library is free software; you can redistribute it and/or
   modify it under the terms of the GNU Lesser General Public
   License as published by the Free Software Foundation; either
   version 3 of the License, or (at your option) any later version.

   This library is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
   Lesser General Public License for more details.

   You should have received a copy of the GNU Lesser General
   Public License along with this library; if not, write to the
   Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
   Boston, MA 02110-1301 USA 
*/
/**
 * The PO file for the currently selected language
 */
var po_file;

/**
 * The user's current locale
 */
var locale;

(function( $ ){
	/**
	 * Internationalize selected elements with the provided PO file
	 */
	$.fn.i18n = function(po_file) {
		// If no PO file is provided, then don't translate anything
		if (! po_file)
			return this;
		
		// If key is not found, return original language
		var translate = function(key, po_file) {
			if (typeof po_file[key] == "undefined") {
				return "";
			} else {
				return po_file[key];
			}
		};		

		// Iterate over UI elements that need to be translated
		return $.each(this, function() {
			element = $(this);
			
			// Translate text
			if (element.html()) {
				translated_text = translate( element.html(), po_file );
				if (translated_text) {
					element.data('original', element.html());
					element.html(translated_text);
				}
			}
			
			// Translate title
			if (element.attr('title')) {
				translated_title = translate( element.attr('title'), po_file );
				if (translated_title) {
					element.data('original', element.attr('title'));
					element.attr({ 'title': translated_title });
				}
			}
			
			// Remove class so this element isn't repeatedly translated
			element.removeClass('i18n');
			element.addClass('i18n_translated');
		});
	};
	
	$.fn.un_i18n = function() {
		// Iterate over UI elements to replace the original text
		return $.each(this, function() {
			element = $(this);
			
			if (element.text())
				element.text(element.data('original'));
			
			if (element.attr('title'))
				element.attr({ 'title': element.data('original') });
			
			element.addClass('i18n');
			element.removeClass('i18n_translated');
		});
	};
})( jQuery );

/**
 * Automatically internationalize the UI based on the user's Accept-Language header
 */
automatic_i18n = function() {
	$.ajax({
		url: BASE_URL + 'i18n/index.jsp',
		type: 'GET',
		dataType: 'text',
		success: function(data) {
			locale = data.substring(0,2);
			
			// Load language file if it isn't English
			if (locale != "en") {
    			$.ajax({
    				url: BASE_URL + 'i18n/' + locale + ".json",
    				type: 'GET',
    				dataType: 'json',
    				success: function(data) {
    					po_file = data;
    				}
    			});
			}
		}
	});
}();
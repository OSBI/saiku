/**
 * The user's current locale
 */
Saiku.i18n = {
    locale: (navigator.language || navigator.browserLanguage || 
        navigator.systemLanguage || navigator.userLanguage).substring(0,2),
    po_file: {},
    translate: function() {
        $('.i18n').i18n(Saiku.i18n.po_file);
    },
    automatic_i18n: function() {
        // Load language file if it isn't English
        if (Saiku.i18n.locale != "en") {
            $.ajax({
                url: "js/saiku/plugins/I18n/po/" + Saiku.i18n.locale + ".json",
                type: 'GET',
                dataType: 'json',
                success: function(data) {
                    Saiku.i18n.po_file = data;
                    Saiku.i18n.translate();
                }
            });
        }
        
        return true;
    },
    elements: []
};

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
				    if (Saiku.i18n.elements.indexOf(element.html()) === -1) {
				        Saiku.i18n.elements.push(element.html());
				    }
					element.data('original', element.html());
					element.html(translated_text);
					element.removeClass('i18n');
				}
			}
			
			// Translate title
			if (element.attr('title')) {
				translated_title = translate( element.attr('title'), po_file );
				if (translated_title) {
				    if (Saiku.i18n.elements.indexOf(element.attr('title')) === -1) {
                        Saiku.i18n.elements.push(element.attr('title'));
                    }
					element.data('original', element.attr('title'));
					element.attr({ 'title': translated_title });
					element.removeClass('i18n');
				}
			}
			
			// Remove class so this element isn't repeatedly translated
			if (element.hasClass('i18n')) {
			    element.addClass('i18n_failed');
			}
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
			element.removeClass('i18n_translated')
			    .removeClass('i18n_failed');
		});
	};
})( jQuery );

/**
 * Automatically internationalize the UI based on the user's locale
 */
Saiku.i18n.automatic_i18n();

/** 
 * Add translate button
 */
Saiku.events.bind('toolbar:render', function(args) {
    var $link = $("<a />").attr({ 
            href: "#translate",
            title: "Improve this translation"
        })
        .addClass('sprite translate');
    var $li = $("<li />").append($link);
    $(args.toolbar.el).find('ul').append($li);
});

/**
 * Bind to new workspace
 */
Saiku.events.bind('session:new', function() {    
    // Translate elements already rendered
    Saiku.i18n.translate();
    
    // Translate new workspaces
    Saiku.session.bind('tab:add', Saiku.i18n.translate);
});

/**
 * Initialize Loggly input for user-provided translations
 */
window.Translate = new loggly({ 
    url: (("https:" == document.location.protocol) 
            ? "https://logs.loggly.com" 
            : "http://logs.loggly.com") 
            + '/inputs/9cc35a94-a2a9-41eb-b9b2-e7f53bb5f989?rt=1', 
    level: 'log'
});
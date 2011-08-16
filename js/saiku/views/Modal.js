/**
 * The base class for all modal dialogs
 */
var Modal = Backbone.View.extend({
    tagName: "div",
    className: "dialog",
    type: "modal",
    message: "Put content here",
    
    options: {
        autoOpen: false,
        modal: true,
        title: "Modal dialog",
        resizable: false,
        draggable: false
    },
    
    events: {
        'click a': 'call'
    },
    
    buttons: [
        { text: "OK", method: "close" }
    ],
    
    template: function() {
        return _.template("<div class='dialog_icon'></div>" +
                "<div class='dialog_body'><%= message %></div>" +
        		"<div class='dialog_footer'>" +
            "<% _.each(buttons, function(button) { %>" +
                "<a class='form_button' href='#<%= button.method %>'>&nbsp;<%= button.text %>&nbsp;</a>" +
            "<% }); %>" +
            "</div>")(this);
    },
    
    initialize: function(args) {
        _.extend(this, args);
        _.bindAll(this, "call");
        _.extend(this, Backbone.Events);
    },
    
    render: function() {
        $(this.el).html(this.template())
            .addClass("dialog_" + this.type)
            .dialog(this.options);
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
    
    open: function() {
        $(this.el).dialog('open');
        this.trigger('open', { modal: this });
        return this;
    },
    
    close: function() {
        $(this.el).dialog('destroy').remove();
        return false;
    }
});
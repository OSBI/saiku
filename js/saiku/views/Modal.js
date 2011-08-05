var Modal = Backbone.View.extend({
    tagName: "div",
    className: "dialog",
    type: "modal",
    closeText: "OK",
    message: "Put content here",
    
    options: {
        autoOpen: false,
        modal: true,
        title: "Modal dialog",
        resizable: false,
        draggable: false
    },
    
    events: {
        'click .close': 'close'
    },
    
    template: function() {
        return _.template("<%= message %>" +
        		"<div class='dialog_footer'>" +
            "<a class='close form_button' href='#'>&nbsp;<%= closeText %>&nbsp;</a>" +
            "</div>")(this);
    },
    
    initialize: function(args) {
        _.extend(this, args);
    },
    
    render: function() {
        $(this.el).html(this.template())
            .dialog(this.options)
            .addClass("dialog_body_" + this.type)
            .addClass('sprite');
        return this;
    },
    
    open: function() {
        $(this.el).dialog('open');
        return this;
    },
    
    close: function() {
        $(this.el).dialog('destroy').remove();
        return false;
    }
});
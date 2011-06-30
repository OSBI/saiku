var Modal = Backbone.View.extend({
    tagName: "div",
    title: "Modal dialog",
    type: "modal",
    action: "OK",
    message: "Put content here",
    
    events: {
        'click .close': 'close'
    },
    
    initialize: function(args) {
        _.extend(this, args);
        this.render();
    },
    
    template: function() {
        return _.template("<div id='dialog' class='dialog'>" +
    		"<div class='dialog_inner'>" +
            "<div class='dialog_header'>" +
            "<h3><%= title %></h3>" +
            "<a href='#' title='Close' class='close_dialog close'>Close</a>" +
            "<div class='clear'></div>" +
            "</div>" +
            "<div class='dialog_body_<%= type %>'><%= message %></div>" +
            "<div class='dialog_footer calign'><a href='#' class='close form_button'>&nbsp;<%= action %>&nbsp;</a>" +
            "</div>" +
            "</div>")(this);
    },
    
    render: function() {
        $(this.el).html(this.template())
            .modal({ opacity: 100 });
        return this;
    },
    
    close: function() {
        // Remove all simple modal objects
        $(this.el).remove();
        $.modal.close();
        return false;
    }
});
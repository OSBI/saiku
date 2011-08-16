/**
 * The view MDX dialog
 */
var MDXModal = Modal.extend({
    type: "mdx",
    
    initialize: function(args) {
        this.options.title = "View MDX";
        this.message = _.template("<textarea><%= mdx %></textarea>")(args);
    }
});
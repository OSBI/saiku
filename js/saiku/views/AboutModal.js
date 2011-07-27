var AboutModal = Modal.extend({
    options: {
        title: "About " + Settings.VERSION
    },
    type: "info",
    message: Settings.VERSION + "<br>" + 
        "<a href='http://www.analytical-labs.com'>http://www.analytical-labs.com/</a>"
});
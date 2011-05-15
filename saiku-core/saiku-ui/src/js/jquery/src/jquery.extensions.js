jQuery.extend({
    getScript: function(url, callback) {
        var head = document.getElementsByTagName("head")[0] || document.documentElement;
        var script = document.createElement("script");
        script.src = url;
        var done = false;

        script.onload = script.onreadystatechange = function() {
          if ( !done && (!this.readyState || this.readyState === "loaded" ||
                 this.readyState === "complete") ) {
            done = true;
            if (callback) callback();

            script.onload = script.onreadystatechange = null;
            if ( head && script.parentNode ) {
                    head.removeChild( script );
            }
          }
        };
        head.insertBefore( script, head.firstChild );
        return undefined;
    }
});
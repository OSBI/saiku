/**
 * Initialize Loggly sensor
 */
window.Log = new loggly({ 
    url: 'http://demo.analytical-labs.com:7000/input/errors',
    level: 'log'
});

/**
 * Log errors to Loggly
 */
window.defaultHandler = window.error;
window.onerror = function(errorMsg, url, lineNumber) {
    if (lineNumber !== 0) {
        Log.log("\n" +
        		"Browser: " + navigator.userAgent + "\n" +
        		"Message: " + errorMsg + "\n" +
        		"File: " + url + "\n" +
        	    "Line no: " + lineNumber
        );
    }
    
    if (defaultHandler) {
        return defaultHandler(errorMsg, url, lineNumber);
    }
    
    return true;
};
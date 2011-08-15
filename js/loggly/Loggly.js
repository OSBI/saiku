/**
 * Initialize Loggly sensor
 */
window.Log = new loggly({ 
    url: (("https:" == document.location.protocol) 
            ? "https://logs.loggly.com" 
            : "http://logs.loggly.com") 
            + '/inputs/eea8d878-db25-43f4-b3b8-18053bb54004?rt=1', 
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
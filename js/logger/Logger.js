/**
 * Initialize logger
 */
var logger = function(config) { 
    this.url = config.url;
    this.log = function(data) {
        janky({
            url: this.url,
            method: "post",
            data: data,
            error: function() {
                console.log("Could not reach telemetry server");
            }
        });
    };
};

if (Settings.ERROR_LOGGING) {
    window.Log = new logger({
        url: Settings.TELEMETRY_SERVER + '/input/errors'
    });
    
    /**
     * Log errors
     */
    window.defaultHandler = window.error;
    window.onerror = function(errorMsg, url, lineNumber) {
        if (lineNumber !== 0) {
            Log.log({
            		browser: navigator.userAgent,
                    browserName: navigator.appCodeName,
                    browserVersion: navigator.appVersion,
            		message: errorMsg,
            		file: url,
            	    lineNumber: lineNumber,
            	    timestamp: new Date(),
                    version: Settings.VERSION,
                    biplugin: Settings.BIPLUGIN
            });
        }
        
        if (defaultHandler) {
            return defaultHandler(errorMsg, url, lineNumber);
        }
        
        return true;
    };
}
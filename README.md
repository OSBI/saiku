saiku UI
==============================
A user interface for the analytical tool saiku <br />
For more information, see [saiku](http://saikuanalytics.com)

You can put the UI on a separate server (apache httpd or simply a webapp in tomcat/webapps e.g)

Build Instructions
------------------

* Build using Maven

	- USAGE: mvn TASK1, TASK2, ...
	
	- Main Tasks:
	
		+ clean: deletes all the build dirs
		+ package: creates a .zip and .war (for dropping the UI in a java webapp environment) file in target/ that contains the saiku UI
		+ install: installs the .war file in local Maven repo (eg. ~/.m2)


Run UI on Node.js proxy
------------------
You can simply test and run the UI on a node.js proxy server called server.js, that will utilize a remote backend as source.

Just run the following command in your command line and then access the UI in the browser (http://localhost:8080):

    node server.js


Attention: For running the server you will need to install express.
You can do that by using npm

    npm install express
    

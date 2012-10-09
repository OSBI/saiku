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

Just run the following command in your command line and then access the UI in
the browser (by default, it will run at http://localhost:8080 and proxy requests to dev.analytical-labs.com:80):

    node server.js [port] [backend_host] [backend_port]


Attention: For running the server you will need to install express.
You can do that by using npm

    npm install express
    
License
------------------
Saiku and the Saiku UI are free software. The UI, contained in this repository,
is available under the terms of the Apache License Version 2. A copy is attached for your convenience.

..

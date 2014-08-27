SAIKU
---------------

*Issue Tracker: http://jira.meteorite.bi*


Usage: ./saiku build <all | project>
	Builds all or an individual saiku project

	Example:
	saiku build all

	Others:
	saiku build < all | ui | server | webapp | bi-platform-plugin >
Usage: ./saiku run <package>
	package can be:

		server <start|stop>
			starts or stops the server, according to the argument

		ui [port] [backend_host] [backend_port]
			Executes node saiku-ui/server.js [port] [backend_host] [backend_port]
			Default is:
				node server.js 8080 dev.analytical-labs.com 80

mvn clean clover2:setup test clover2:aggregate clover2:clover

If you require Foodmart for a different database checkout the foodmart loader wrapper script: https://github.com/OSBI/foodmart-data

Help and Support
________________

http://community.meteorite.bi
(Work in progress)

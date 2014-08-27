# [Saiku UI](http://meteorite.bi/saiku)

[![saiku-view](https://dl.dropboxusercontent.com/u/13927708/SaikuBlog/saiku-view.png)](http://demo.analytical-labs.com)

A user interface for the analytical tool Saiku. <br />
For more information, see [Saiku](http://www.meteorite.bi/saiku).

> You can put the UI on a separate server (apache httpd or simply a webapp in tomcat/webapps e.g).

## Setup

### Build Instructions

* Build using Maven

	- USAGE: mvn TASK1, TASK2, ...
	
	- Main Tasks:
	
		+ clean: deletes all the build dirs
		+ package: creates a .zip and .war (for dropping the UI in a java webapp environment) file in target/ that contains the Saiku UI
		+ install: installs the .war file in local Maven repo (eg. ~/.m2)

### Run UI on Node.js proxy

In order to run it locally you'll need a basic server setup.

1. Install [NodeJS](http://nodejs.org/download/), if you don't have it yet.
2. Install local dependencies:

	```sh
	npm install
	```
3. You can simply test and run the UI on a NodeJS proxy server called [server.js](https://github.com/OSBI/saiku-ui/blob/master/server.js), that will utilize a remote backend as source.

	Just run the following command in your command line and then access the UI in
	the browser (by default, it will run at [http://localhost:8080](http://localhost:8080) and proxy requests to dev.analytical-labs.com:80):

		node server.js [port] [backend_host] [backend_port]

## Wiki

* [Meteorite BI Wiki](http://wiki.meteorite.bi/display/SAIK/Saiku)

## Bugs and Feature Requests

* [Meteorite BI Jira](http://jira.meteorite.bi/)

## Discussion

* [Meteorite BI Forums](http://forums.meteorite.bi/)
* [Stack Overflow](http://stackoverflow.com/questions/tagged/saiku)
* [Freenode IRC - Channel: #saiku](http://irc.lc/freenode/%23saiku/t4nk@)

## Browser Support

We do care about it.

![IE](https://raw.github.com/alrra/browser-logos/master/internet-explorer/internet-explorer_48x48.png) | ![Chrome](https://raw.github.com/alrra/browser-logos/master/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/firefox/firefox_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/opera/opera_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/safari/safari_48x48.png)
--- | --- | --- | --- | --- |
IE 8+ ✔ | Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ |

## Team

[Saiku UI](http://meteorite.bi/saiku) is maintained by these people and a bunch of awesome [contributors](https://github.com/OSBI/saiku-ui/graphs/contributors).

[![Tom Barber](https://avatars0.githubusercontent.com/u/103544?v=2&s=70)](https://github.com/buggtb) | [![Paul Stoellberger](https://avatars3.githubusercontent.com/u/454645?v=2&s=70)](https://github.com/pstoellberger) | [![Mark Cahill](https://avatars3.githubusercontent.com/u/200365?v=2&s=70)](https://github.com/thinkjson) | [![Breno Polanski](https://avatars1.githubusercontent.com/u/1894191?v=2&s=70)](https://github.com/brenopolanski) 
--- | --- | --- | --- | --- | --- | ---
[Tom Barber](https://github.com/buggtb) | [Paul Stoellberger](https://github.com/pstoellberger) | [Mark Cahill](https://github.com/thinkjson) | [Breno Polanski](https://github.com/brenopolanski)

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :)

## History

For detailed changelog, check [Releases](https://github.com/OSBI/saiku-ui/releases).

## License

Saiku and the Saiku UI are free software. The UI, contained in this repository,
is available under the terms of the Apache License Version 2. A copy is attached for your convenience.

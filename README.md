<img src="http://chat.meteorite.bi/badge.svg">


SAIKU
---------------
*BUILDING*

mvn clean install -DskipTests


*Issue Tracker: http://jira.meteorite.bi*



mvn clean clover2:setup test clover2:aggregate clover2:clover

If you require Foodmart for a different database checkout the foodmart loader wrapper script: https://github.com/OSBI/foodmart-data

Help and Support
________________

http://community.meteorite.bi
(Work in progress)

Contributing
_____________

Please read CONTRIBUTING.md for contribution guidelines.

Build Artifacts
________________

Build artifacts can be found in our Nexus repo: http://repo.meteorite.bi

Docker Image
_____________

The latest and greatest builds are pushed to dockerhub: https://hub.docker.com/r/buggtb/saikuce/

To run you can execute: docker pull buggtb/saikuce

Juju Charm
__________

Saiku is now available as a Juju charm this can be deployed in Ubuntu Trusty with:

juju deploy tomcat
juju deploy cs:~f-tom-n/trusty/saikuanalytics
juju add-relation saikuanalytics tomcat
juju expose tomcat

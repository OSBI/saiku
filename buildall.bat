cd saiku-core
mvn clean install 
cd ..
cd saiku-webapp
mvn clean install
cd ..
cd saiku-server
mvn clean scm:checkout package


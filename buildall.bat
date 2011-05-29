cd saiku-core
call mvn clean install
cd ..
cd saiku-webapp
call mvn clean 
cd ../saiku-ui
cd saiku-ui
call mvn clean package install:install-file -Dfile=target/saiku-ui-2.0.war  -DgroupId=org.saiku -DartifactId=saiku-ui -Dversion=2.0 -Dpackaging=war
cd ../saiku-server
call mvn clean package

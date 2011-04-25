cd saiku-core
call mvn clean install
cd ..
cd saiku-webapp
call mvn clean scm:checkout install
cd ..
cd saiku-server
call mvn clean package

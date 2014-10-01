
echo "Building saiku-core"
cd saiku-core
call mvn clean install
cd ..
echo "Building saiku-webapp"
cd saiku-webapp
call mvn clean install
cd ..
call git submodule init
call git submodule update
echo "Building saiku-ui"
cd ..\saiku-ui
call git checkout 3.0-GA
call git pull
call mvn clean package install:install-file -Dfile=target/saiku-ui-3.0-GA.war  -DgroupId=org.saiku -DartifactId=saiku-ui -Dversion=3.0-GA -Dpackaging=war
echo "Building saiku-server"
cd ..\saiku\saiku-server
call mvn clean package
echo "Building saiku-bi-platform-plugin"
cd ..\saiku-bi-platform-plugin
call mvn clean package
echo "Building saiku-bi-platform-plugin-p5"
cd ..\saiku-bi-platform-plugin-p5
call mvn clean package

#!/bin/bash
cd saiku-core
mvn clean install 
cd ..
cd saiku-webapp
mvn clean scm:checkout install
cd ..
cd saiku-server
mvn clean package


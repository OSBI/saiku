#!/bin/sh

DIR_REL=$1
#echo $DIR_REL

TEMP="${DIR_REL%\"}"
TEMP="${TEMP#\"}"

DIR_REL=$TEMP

if [ -z "$DIR_REL" ]
then
DIR_REL=`dirname $0`
fi

echo $DIR_REL

cd $DIR_REL
DIR=`pwd`
cd -

. "$DIR/set-java.sh"

 setJava

 cd "$DIR/tomcat/bin"
 export CATALINA_OPTS="-Xms256m -Xmx768m -XX:MaxPermSize=256m -Dfile.encoding=UTF-8 -Dorg.apache.tomcat.util.buf.UDecoder.ALLOW_ENCODED_SLASH=true -Djava.awt.headless=true"
 JAVA_HOME=$_JAVA_HOME
 sh startup.sh

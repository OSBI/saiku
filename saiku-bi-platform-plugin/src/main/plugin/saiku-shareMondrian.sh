#!/bin/bash

# This script makes saiku use the same mondrian as pentaho. Useful to share cache and resources (including CDC)
#
# Use this on pentaho 4.5 (mondrian 3.4) onwards

usage (){

	echo 
	echo "Usage: saiku-shareMondrian.sh -w pentahoWebapPath]"
	echo
	echo "-w    Pentaho webapp server path"
	echo "-h    This help screen"
	echo
	exit 1
}

[ $# -gt 1 ] || usage

WEBAPP_PATH='PATH'				

ORIGINAL_CMDS=$@

while [ $# -gt 0 ]
do
    case "$1" in
	--)	shift; break;;
	-w)	WEBAPP_PATH="$2"; shift;;
	--)	break;;
	-*|-h)	usage ;;
    esac
    shift
done

[ $WEBAPP_PATH = 'PATH' ] && usage

if [[ ! -d $WEBAPP_PATH/WEB-INF/lib ]]
then

	echo "ERROR: Supplied webapp path doesn't look like a valid web application - missing WEB-INF/lib"
	exit 1
fi


# Step 1: Change plugin.spring.xml

echo -n "Changing saiku configuration.... "

cp plugin.spring.xml plugin.spring.xml.bak
sed  's/\(.*datasourceResolverClass.*\)/<!-- \1 -->/; s/\(.*saikuDatasourceProcessor.*\)/<!-- \1 -->/; s/PentahoSecurityAwareConnectionManager" init-method="init"/PentahoSecurityAwareConnectionManager"/; s/ name="connectionPooling" value="true"/ name="connectionPooling" value="false"/; s/<!--\(.*dynamicSchemaProcessor.*\)-->/\1/' plugin.spring.xml.bak > plugin.spring.xml

echo Done


# Step 2: Delete saiku's libs

echo -n "Deleting Saiku version of mondrian.jar and related dependencies.... "
rm -f lib/mondrian* lib/olap4j* lib/eigenbase*

echo Done


# Step 3: Copy jar to WEB-INF

echo -n "Copying plugin-util.jar to WEB-INF/lib .... "
cp lib/saiku*plugin-util* $WEBAPP_PATH/WEB-INF/lib/

echo Done


# Step 4: Changing pentahoObjects.spring.xml to use the new connection-MDX bean

echo -n "Changing pentahoObjects.spring.xml to use the new connection-MDX bean... "

cp ../pentahoObjects.spring.xml ../pentahoObjects.spring.xml.bak
sed  's/org.pentaho.platform.plugin.services.connections.mondrian.MDXConnection/org.pentaho.platform.plugin.services.connections.mondrian.SharedCacheMDXConnection/' ../pentahoObjects.spring.xml.bak > ../pentahoObjects.spring.xml

echo Done
echo
echo Finished. Now you should ask yourself - what have I done?




#!/bin/bash

# This script makes saiku use the same mondrian as pentaho. Useful to share cache and resources (including CDC) on pentaho >= 4.8
#

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
sed  's/\(.*datasourceResolverClass.*\)/<!-- \1 -->/; s/\(.*saikuDatasourceProcessor.*\)/<!-- \1 -->/; s/PentahoSecurityAwareConnectionManager" init-method="init"/PentahoSecurityAwareConnectionManager"/; s/ name="connectionPooling" value="true"/ name="connectionPooling" value="false"/;' plugin.spring.xml.bak > plugin.spring.xml

echo Done


# Step 2: Delete saiku's libs

echo -n "Deleting Saiku version of mondrian.jar and related dependencies.... "
rm -f lib/mondrian* lib/mondrian.olap4j* lib/eigenbase*


# Step 3: Copy jar to WEB-INF

echo -n "Copying olap-util.jar to WEB-INF/lib .... "
mv lib/saiku*olap-util* $WEBAPP_PATH/WEB-INF/lib/


echo Done



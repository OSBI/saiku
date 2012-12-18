#!/bin/bash

# This script makes saiku use the same mondrian as pentaho. Useful to share cache and resources (including CDC) on pentaho >= 4.8
#

# Step 1: Change plugin.spring.xml

echo -n "Changing saiku configuration.... "

cp plugin.spring.xml plugin.spring.xml.bak
sed  's/\(.*datasourceResolverClass.*\)/<!-- \1 -->/; s/\(.*saikuDatasourceProcessor.*\)/<!-- \1 -->/; s/PentahoSecurityAwareConnectionManager" init-method="init"/PentahoSecurityAwareConnectionManager"/; s/ name="connectionPooling" value="true"/ name="connectionPooling" value="false"/;' plugin.spring.xml.bak > plugin.spring.xml

echo Done


# Step 2: Delete saiku's libs

echo -n "Deleting Saiku version of mondrian.jar and related dependencies.... "
rm -f lib/mondrian* lib/olap4j* lib/eigenbase*

echo Done



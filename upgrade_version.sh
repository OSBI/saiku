#!/bin/bash
echo ==========================================================
echo "|  Change    Version Number 0.1"
echo "|  --------------------------------------------------------"
echo "|  Usage:    sh upgrade.sh VERSION1 VERSION2 FILEPATTERN"
echo "|  Example:  sh upgrade.sh 2.0-SNAPSHOT 2.0 pom.xml"
echo ===========================================================
echo 

version1="$1"
version2="$2"
pattern="$3"
echo "Replacing: . all $version1 with: $version2 for all files that match: $pattern"
for i in `find saiku* |grep $pattern` ; do
echo $i
`sed "s/$version1/$version2/g" $i > $i.bak`
`mv $i.bak $i`
# sed -i -e"s/$version1/$version1/g" $i 

done

# update the build files as well

for i in `find buildall*` ; do
echo $i
`sed "s/$version1/$version2/g" $i > $i.bak`
`mv $i.bak $i`
# sed -i -e"s/$version1/$version1/g" $i

done

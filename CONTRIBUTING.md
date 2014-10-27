We love community submissions!

To get started, <a href="https://www.clahub.com/agreements/OSBI/saiku">sign the Contributor License Agreement</a>.

Saiku Server has checkstyle code checks in place to make sure we adhere to a decent coding standard. If you run mvn clean package and it reports checkstyle errors, please do not push your changes, they will be rejected or reverted.
There is a basic IntelliJ Idea formatter available in saiku/src/main/config/checkstyle which you can import and use although it doesn't fix every case. Eclipse users are more than welcome to donate a formatter.

The build has changed recently and the build scripts are no longer required, running mvn clean install in the top level directory should be enough to build a working Saiku Server. To update the saiku ui to the main trunk version run 
git pull -s subtree saiku-ui master 

As Saiku UI is a subtree you can now edit within that directory and push back upstream if you have commit rights:

git subtree push --prefix ./saiku-ui saiku-ui master

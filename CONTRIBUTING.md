We love community submissions!

To get started, please <a href="https://www.clahub.com/agreements/OSBI/saiku">sign the Contributor License Agreement</a> so we can accept your pull requests. 

Commit Messages
_______________

Please try and make sure there is a relevant Jira ticket available to commit against, this helps us track issues and the code committed to fix the issue/enhancement

When committing please format your commit message with a Jira reference and comment for example:
git commit -a -m "SKU-1234 #comment fix bug x by doing y

Git Flow
________

We develop using the git flow framework, please develop against the development branch, although how you develop against your own fork is up to you, pull requests against master will no longer be accepted.

For people developing directly in our repository please create feature branches, hot fix branches, and release branches, you can do this manually but we have a mavne plugin to make life easier:

== Feature Branches ==

*Create a feature branch*

mvn jgitflow:feature-start

== Hot Fix Branches ==

Hot fixes are releases forked from the latest release branch and merged back into master and development. After you have completed a hotfix a new release should be issued.

*Create a hot fix*

mvn jgitflow:hotfix-start

*Finish a hot fix*

mvn jgitflow:hotfix-finish -DkeepBranch -DnoHotfixBuild

== Release Branches ==

Release branches are created when the development branch is feature complete, if not bug free. Once a release branch has been created you are still free to fix bugs within the release branch.

*Create Release Branch*
mvn jgitflow:release-start

*Finish Release*
mvn jgitflow:release-finish -DnoReleaseBuild

## We love community submissions!

To get started, please [sign the Contributor License Agreement](https://www.clahub.com/agreements/OSBI/saiku) so we can accept your pull requests.

Follow the standards of [**Style Guide**](https://github.com/OSBI/saiku-styleguide) Saiku :metal:

### Commit Messages

Please try and make sure there is a relevant [issue ticket](https://github.com/OSBI/saiku/issues) available to commit against, this helps us track issues and the code committed to fix the issue/enhancement.

When committing please format your commit message with an issue reference and comment for example:

```sh
git commit -a -m "#1234 - Fix bug x by doing y"
```

Where `#1234` represents the issue number.

### Git Flow

We develop using the git flow framework, please develop against the [development](https://github.com/OSBI/saiku/tree/development) branch, although how you develop against your own fork is up to you, pull requests against **master** will no longer be accepted.

For people developing directly in our repository please create feature branches, hot fix branches, and release branches, you can do this manually but we have a maven plugin to make life easier:

#### Feature Branches

##### Create a feature branch:

```sh
mvn jgitflow:feature-start
```

#### Hot Fix Branches

Hot fixes are releases forked from the latest release branch and merged back into master and development. After you have completed a hotfix a new release should be issued.

##### Create a hot fix:

```sh
mvn jgitflow:hotfix-start
```

##### Finish a hot fix:

```sh
mvn jgitflow:hotfix-finish -DkeepBranch -DnoHotfixBuild
```

#### Release Branches

Release branches are created when the development branch is feature complete, if not bug free. Once a release branch has been created you are still free to fix bugs within the release branch.

##### Create Release Branch:

```sh
mvn jgitflow:release-start
```

##### Finish Release:

```sh
mvn jgitflow:release-finish -DnoReleaseBuild
```

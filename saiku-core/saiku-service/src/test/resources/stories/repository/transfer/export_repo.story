Story: An admin user should be able to export all the data from the repo

Scenario: An admin user should be able to export the repository to a backup location

Given an existing repository with content
When the export routine is executed
Then the server should export the content of the repository to a zip file
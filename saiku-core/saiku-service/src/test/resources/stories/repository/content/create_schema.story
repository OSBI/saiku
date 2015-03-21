Story: User saves a mondrian schema to the repository

Scenario: When user admin admin creates a mondrian schema they save it to the jackrabbit repository

Given user joe has a valid mondrian schema file
When joe hits save that file to the repository schema pool
Then the repository stores the schema for joe in the correct location
Story: A user wants to add a data source to the server

Scenario: User admin saves a valid datasource to the server

Given user joe has a valid datasource
When joe saves the datasource
Then it should be stored within the jackrabbit repository in the datasource pool for joe


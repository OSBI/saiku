Story: A user saves a query to the repository

Scenario: Joe creates a query and presses the save button

Given user Joe has created a valid query
When the query is saved to Joe's home directory
Then it should be stored within the jackrabbit repository in the correct location
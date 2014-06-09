Story: When the server starts the repository should be initialised cleanly

Scenario: The jackrabbit repository should be initialised.

Given the server is starting up
When the initialisation is in progress
Then the jackrabbit repository should start cleanly
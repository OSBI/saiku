Story: When the server is shutdown the repository should be stopped.

Scenario: When a shutdown is executed the repository should be brought down cleanly.

Given a running server
When the shutdown is requested
Then the repository should be shutdown cleanly
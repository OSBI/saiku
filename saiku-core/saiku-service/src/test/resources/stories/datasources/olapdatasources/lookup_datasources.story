Story: Users should be able to get and interact with data sources from Saiku.

Scenario: Server is incorrectly configured and wrong path is passed to server.

Given The server has not yet been started
When an incorrect path is passed into the server
Then the server should throw an exception

Scenario: User passes null datasource to server.

Given a null data source is configured in the server
When the data source is loaded
Then a SaikuServiceException should be thrown

Scenario: User wants to add multiple data sources into the server.

Given a server has no available data sources
When 2 new data sources are passed into the server as a list
Then the amount of data sources should equal 2

Scenario: Get all data sources from the server.

Given There are 2 data sources registered on the server
When I check all the available data sources
Then there will be 2 data sources listed

Scenario: Load single data source.

Given There aren't any data sources registered on the server
When I load one data source
Then there will be 1 data sources listed


Scenario: Get a single data source from the server.

Given There are 2 data sources registered on the server
When I request the foodmart data source
Then I will get the details for only the foodmart data source

Scenario: Request a data source from the server but none registered.

Given There aren't any data sources registered on the server
When I request a non existant data source
Then The server should fail gracefully

Scenario: User wants to remove a data source from the server
Given There are 2 data sources registered on the server
When a user removes a data source
Then the server should have 1 remaining data sources

Scenario: User wants to remove a data source from the server without any available data sources
Given a server has no available data sources
When a user removes a non existing data source
Then the server should return unsuccessful state

Scenario: User wants to remove an invalid data source from the server
Given There are 2 data sources registered on the server
When a user removes a data source with an incorrect name
Then the server should return unsuccessful state


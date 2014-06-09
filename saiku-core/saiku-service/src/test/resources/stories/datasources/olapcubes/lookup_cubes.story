Story: Having selected a datasource the user should be able to get the available cubes.

Scenario: Get a cube from a data source.

Given A user has a list of valid data sources
When A user selects a data source
Then It should return a list of available cubes

Scenario: Get a cube from an invalid data source.

Given A user has a list of valid data sources
When A user selects an invalid data source
Then It should fail gracefully


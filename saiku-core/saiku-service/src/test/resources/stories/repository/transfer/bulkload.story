Story: When creating a Saiku demo sample data should be imported on the first load but not subsequently

Scenario: When starting Saiku for the first time sample data should be imported to create a working environment

Given a new saiku installation
When the server is started
Then jackrabbit should import sample data to create a working system.

Scenario: When starting Saiku for a second time the sample data should not be reloaded

Given an existing Saiku installation
When the server is started
Then jackrabbit should not import the sample data
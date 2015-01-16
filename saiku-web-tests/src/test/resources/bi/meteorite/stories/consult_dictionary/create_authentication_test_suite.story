Story: A user should be able to authenticate with the Saiku server
Meta:
@issue SUT-2
Scenario: Given a valid username and password a user should be able to login to the Saiku server
Given there is a default Saiku server
When Admin passes their details to the login form
Then the server should process the information and log them in
Scenario: Given an invalid username a user should be displayed an error message
Given there is a default Saiku server
When Admin passes an invalid username to the server
Then an error message should be displayed
Scenario: Given an invalid password a user should be displayed an error message
Given there is a default Saiku server
When Admin passes an incorrect password to the server
Then an error message should be displayed
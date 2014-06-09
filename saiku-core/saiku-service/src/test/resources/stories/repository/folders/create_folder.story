Story: User creates a new folder to store queries in

Scenario: A new user Joe is created and his home directory needs creating

Given user joe does not exist
When a new user called joe is added
Then a new node called joe needs creating

Scenario: A user called joe already exists
Given a user called joe already exists
When a second user called joe is added
Then a new node should not be created and an exception thrown

Scenario: User Joe creates a new folder within his home directory to store files
Meta:
@skip
@ignored true
Given user joe does not exist
When joe is added
And he adds the testing directory to the home directory
Then a new node testing is created within the jackrabbit repository
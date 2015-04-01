Story: User joe wants to move one folder into another

Scenario: User joe would like to move his folder from home/testing/folder1 to home/folder1
Meta:
@ignore

Given joe has a node within his home directory called testing/folder1
When joe moves the folder1 node from testing to his home directory
Then the folder1 node should be moved within joe 's directory
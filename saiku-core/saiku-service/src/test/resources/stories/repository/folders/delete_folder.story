Story: User Joe wants to delete an old folder and any content within it

Scenario: User Joe deletes a directory within his home directory
Meta:
@ignore

Given user joe has a directory called deletetest in his home directory
When user joe deletes his deletetest folder
Then the joe 's node deletetest should be removed
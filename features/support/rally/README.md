# Rally Integration for Intelligent_Automation Framework

This module enables integration with Rally to:
1. Read user stories from Rally and generate Cucumber/Gherkin feature files
2. Log defects in Rally when tests fail, including screenshots and trace files

## Setup

1. Add the required environment variables to your `.env` file:

```
RALLY_ENABLED=true
RALLY_API_KEY=your_rally_api_key
RALLY_WORKSPACE=https://rally1.rallydev.com/slm/webservice/v2.0/workspace/12345678910
RALLY_PROJECT=https://rally1.rallydev.com/slm/webservice/v2.0/project/12345678910
```

2. Make sure you have the required dependencies installed:

```bash
npm install axios fs-extra path dotenv
```

## Reading User Stories from Rally

You can generate test cases from Rally user stories using the Rally CLI:

```bash
# Generate test cases from all defined stories
node features/support/rally/rally-cli.js generate-tests

# Generate test cases using a specific Rally query
node features/support/rally/rally-cli.js generate-tests --query "(ScheduleState = Defined) AND (Priority = High)"

# Force regeneration of all stories (overwrite existing)
node features/support/rally/rally-cli.js generate-tests --force
```

The generated feature files will be saved to `features/rally-stories/` and can be executed like any other Cucumber feature file.

## Viewing User Stories from Rally

You can use the Rally CLI to view information about user stories:

```bash
# List all user stories
node features/support/rally/rally-cli.js list-stories

# List limited number of stories
node features/support/rally/rally-cli.js list-stories --limit 10

# View details of a specific story
node features/support/rally/rally-cli.js fetch-story US123
```

## Automatic Defect Logging

When tests fail, defects will automatically be logged in Rally if `RALLY_ENABLED` is set to `true` in your `.env` file. The defects will include:

- Test scenario name and details
- Error message
- Steps to reproduce
- Screenshot of the failure
- Trace file (if trace recording is enabled)
- Link to the related user story (if the test was generated from a Rally story)

## Adding to package.json

You can add these commands to your `package.json` scripts section for easier access:

```json
"scripts": {
  // ... existing scripts
  "rally:generate": "node features/support/rally/rally-cli.js generate-tests",
  "rally:list": "node features/support/rally/rally-cli.js list-stories",
  "rally:fetch": "node features/support/rally/rally-cli.js fetch-story"
}
```

Then use them with:

```bash
npm run rally:generate
npm run rally:list
npm run rally:fetch -- US123
```

## Tagging Tests with Rally Story IDs

When you generate tests from Rally stories, they're automatically tagged with the Rally story ID. You can also manually tag your feature files:

```gherkin
Feature: My Feature

  @rally-story-US123
  Scenario: My Scenario
    Given something
    When something else
    Then validate the result
```

This tag ensures that any defects created during test failures will be linked back to the corresponding user story in Rally.

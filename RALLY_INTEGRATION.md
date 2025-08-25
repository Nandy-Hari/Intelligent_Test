# Rally Integration Implementation

This document summarizes the implementation of Rally integration for:
1. Reading user stories from Rally to create respective test cases
2. Logging defects in Rally when tests fail, with all required data & screenshots

## Components Added

### 1. Rally API Client (`features/support/rally/rallyClient.js`)
- Authentication with Rally API
- Methods to fetch user stories from Rally
- Methods to create defects and attach files (screenshots) in Rally

### 2. Rally Test Generator (`features/support/rally/testGenerator.js`)
- Converts Rally user stories into Gherkin feature files
- Parses acceptance criteria to generate steps
- Tracks story changes to avoid regenerating unchanged stories
- Maintains metadata about generated files

### 3. Rally CLI (`features/support/rally/rally-cli.js`)
- Command-line interface for working with Rally
- Commands for generating tests, fetching stories, etc.
- Easy-to-use interface for daily operations

### 4. Modified Hooks (`features/support/hooks.js`)
- Takes screenshots on test failure
- Creates defects in Rally when tests fail
- Attaches screenshots and trace files to Rally defects
- Links defects to original user stories using tags

### 5. Updated World (`features/support/world.js`)
- Includes Rally client for use in step definitions
- Makes Rally integration available throughout tests

### 6. Documentation (`features/support/rally/README.md`)
- Instructions for setting up Rally integration
- Usage examples for the CLI tools
- Explanation of defect logging process

### 7. Package.json Updates
- New npm scripts for Rally operations:
  - `rally:generate` - Generate test cases from Rally stories
  - `rally:list` - List available user stories
  - `rally:fetch` - Fetch details of a specific story
  - `test:rally` - Generate and run tests from Rally stories

## Usage Instructions

### To generate test cases from Rally:
```
npm run rally:generate
```

### To run tests and log defects to Rally:
```
npm test
```

### To view Rally stories:
```
npm run rally:list
```

### Required Environment Variables:
```
RALLY_ENABLED=true
RALLY_API_KEY=your_rally_api_key
RALLY_WORKSPACE=your_workspace_ref
RALLY_PROJECT=your_project_ref
```

## Notes
- Screenshots of test failures are automatically captured and attached to Rally defects
- Tests generated from Rally stories are stored in `features/rally-stories/`
- Metadata about generated tests is maintained in `features/rally-stories/.metadata.json`

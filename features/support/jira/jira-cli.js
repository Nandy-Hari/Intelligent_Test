#!/usr/bin/env node
/**
 * JIRA Integration CLI
 * Command-line interface for JIRA integration features
 */
const path = require('path');
const JiraClient = require('./jiraClient');
const JiraTestGenerator = require('./testGenerator');
require('dotenv').config();

// Parse command arguments
const args = process.argv.slice(2);
const command = args[0];

// Available commands
const commands = {
  'generate-tests': generateTests,
  'fetch-story': fetchStory,
  'list-stories': listStories,
  'create-defect': createDefect,
  'help': showHelp
};

// Main function
async function main() {
  if (!command || !commands[command]) {
    console.log('Unknown command. Use "jira-cli help" to see available commands.');
    return showHelp();
  }
  
  try {
    await commands[command](args.slice(1));
  } catch (error) {
    console.error(`Error executing command "${command}":`, error.message);
    process.exit(1);
  }
}

/**
 * Generate test feature files from JIRA user stories
 * @param {Array<string>} args - Command arguments
 */
async function generateTests(args) {
  const options = parseOptions(args, {
    jql: { flag: '--jql', hasValue: true },
    force: { flag: '--force', hasValue: false }
  });
  
  console.log('Generating test cases from JIRA user stories...');
  const generator = new JiraTestGenerator();
  
  try {
    const files = await generator.generateFeatureFiles({
      jql: options.jql,
      force: options.force
    });
    
    console.log(`Successfully generated ${files.length} feature files from JIRA stories`);
  } catch (error) {
    console.error('Error generating feature files:', error.message);
    process.exit(1);
  }
}

/**
 * Fetch and display a specific user story
 * @param {Array<string>} args - Command arguments
 */
async function fetchStory(args) {
  if (!args[0]) {
    console.error('Error: Story key is required. Example: "jira-cli fetch-story PROJ-123"');
    return process.exit(1);
  }
  
  const issueKey = args[0];
  const jiraClient = new JiraClient();
  
  try {
    console.log(`Fetching user story ${issueKey} from JIRA...`);
    const issue = await jiraClient.getUserStory(issueKey);
    
    // Display story details
    console.log(`\n=== Story ${issue.key}: ${issue.fields.summary} ===`);
    console.log('Description:');
    const description = jiraClient._extractTextFromADF(issue.fields.description);
    console.log(description || '(No description)');
    console.log('\nAcceptance Criteria:');
    const acceptanceCriteria = jiraClient.getAcceptanceCriteria(issue);
    console.log(acceptanceCriteria || '(No acceptance criteria)');
    console.log('\nStatus:', issue.fields.status?.name || 'Unknown');
    console.log('Priority:', issue.fields.priority?.name || 'Unspecified');
    console.log('Assignee:', issue.fields.assignee?.displayName || 'Unassigned');
  } catch (error) {
    console.error(`Error fetching story ${issueKey}:`, error.message);
    process.exit(1);
  }
}

/**
 * List user stories from JIRA
 * @param {Array<string>} args - Command arguments
 */
async function listStories(args) {
  const options = parseOptions(args, {
    jql: { flag: '--jql', hasValue: true },
    limit: { flag: '--limit', hasValue: true }
  });
  
  const jiraClient = new JiraClient();
  
  try {
    console.log('Fetching user stories from JIRA...');
    const issues = await jiraClient.getUserStories(options.jql);
    
    const limit = options.limit ? parseInt(options.limit, 10) : issues.length;
    const displayIssues = issues.slice(0, limit);
    
    console.log(`\n=== Found ${issues.length} stories ===`);
    displayIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.key}: ${issue.fields.summary}`);
      console.log(`   Status: ${issue.fields.status?.name || 'Unknown'}`);
      console.log(`   Priority: ${issue.fields.priority?.name || 'Unspecified'}`);
      console.log('');
    });
    
    if (issues.length > limit) {
      console.log(`...and ${issues.length - limit} more stories.`);
    }
  } catch (error) {
    console.error('Error listing stories:', error.message);
    process.exit(1);
  }
}

/**
 * Create a defect in JIRA
 * @param {Array<string>} args - Command arguments
 */
async function createDefect(args) {
  const options = parseOptions(args, {
    summary: { flag: '--summary', hasValue: true },
    description: { flag: '--description', hasValue: true },
    priority: { flag: '--priority', hasValue: true },
    story: { flag: '--story', hasValue: true }
  });
  
  if (!options.summary) {
    console.error('Error: --summary is required');
    return process.exit(1);
  }
  
  const jiraClient = new JiraClient();
  
  const defectData = {
    summary: options.summary,
    description: options.description || 'Created via JIRA CLI',
    priority: options.priority || 'Medium',
    storyKey: options.story
  };
  
  try {
    console.log('Creating defect in JIRA...');
    const defect = await jiraClient.createDefect(defectData);
    console.log(`Defect created successfully: ${defect.key}`);
  } catch (error) {
    console.error('Error creating defect:', error.message);
    process.exit(1);
  }
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
JIRA Integration CLI

Usage:
  jira-cli <command> [options]

Commands:
  generate-tests      Generate feature files from JIRA user stories
    Options:
      --jql <jql>      JQL query to filter stories
      --force          Force regeneration of all stories
      
  fetch-story <key>   Fetch and display a specific user story
  
  list-stories        List user stories from JIRA
    Options:
      --jql <jql>      JQL query to filter stories
      --limit <num>    Limit the number of stories displayed
      
  create-defect       Create a defect in JIRA
    Options:
      --summary <text>    Defect summary (required)
      --description <text> Defect description
      --priority <level>   Priority (Highest, High, Medium, Low, Lowest)
      --story <key>       Link to user story
      
  help                Show this help message

Examples:
  jira-cli generate-tests --jql "project = MYPROJ AND issuetype = Story"
  jira-cli fetch-story PROJ-123
  jira-cli list-stories --limit 10
  jira-cli create-defect --summary "Login fails" --priority High --story PROJ-123

Required environment variables in .env file:
  JIRA_USERNAME       JIRA username/email
  JIRA_API_TOKEN      JIRA API token
  JIRA_BASE_URL       JIRA instance URL (e.g., https://yourcompany.atlassian.net)
  JIRA_PROJECT_KEY    JIRA project key
`);
}

/**
 * Parse command options
 * @param {Array<string>} args - Command arguments
 * @param {Object} optionDefs - Option definitions
 * @returns {Object} - Parsed options
 */
function parseOptions(args, optionDefs) {
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    for (const [option, def] of Object.entries(optionDefs)) {
      if (arg === def.flag) {
        if (def.hasValue && i + 1 < args.length) {
          options[option] = args[i + 1];
          i++;
        } else {
          options[option] = true;
        }
        break;
      }
    }
  }
  
  return options;
}

// Run the CLI
main();

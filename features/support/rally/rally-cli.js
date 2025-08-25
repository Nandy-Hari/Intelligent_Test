#!/usr/bin/env node
/**
 * Rally Integration CLI
 * Command-line interface for Rally integration features
 */
const path = require('path');
const RallyClient = require('./rallyClient');
const RallyTestGenerator = require('./testGenerator');
require('dotenv').config();

// Parse command arguments
const args = process.argv.slice(2);
const command = args[0];

// Available commands
const commands = {
  'generate-tests': generateTests,
  'fetch-story': fetchStory,
  'list-stories': listStories,
  'help': showHelp
};

// Main function
async function main() {
  if (!command || !commands[command]) {
    console.log('Unknown command. Use "rally-cli help" to see available commands.');
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
 * Generate test feature files from Rally user stories
 * @param {Array<string>} args - Command arguments
 */
async function generateTests(args) {
  const options = parseOptions(args, {
    query: { flag: '--query', hasValue: true },
    force: { flag: '--force', hasValue: false }
  });
  
  console.log('Generating test cases from Rally user stories...');
  const generator = new RallyTestGenerator();
  
  try {
    const files = await generator.generateFeatureFiles({
      query: options.query,
      force: options.force
    });
    
    console.log(`Successfully generated ${files.length} feature files from Rally stories`);
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
    console.error('Error: Story ID is required. Example: "rally-cli fetch-story US123"');
    return process.exit(1);
  }
  
  const storyId = args[0];
  const rallyClient = new RallyClient();
  
  try {
    console.log(`Fetching user story ${storyId} from Rally...`);
    const story = await rallyClient.getUserStory(storyId);
    
    // Display story details
    console.log(`\n=== Story ${story.FormattedID}: ${story.Name} ===`);
    console.log('Description:');
    console.log(story.Description || '(No description)');
    console.log('\nAcceptance Criteria:');
    console.log(story.AcceptanceCriteria || '(No acceptance criteria)');
    console.log('\nNotes:');
    console.log(story.Notes || '(No notes)');
    console.log('\nPriority:', story.Priority || 'Unspecified');
  } catch (error) {
    console.error(`Error fetching story ${storyId}:`, error.message);
    process.exit(1);
  }
}

/**
 * List user stories from Rally
 * @param {Array<string>} args - Command arguments
 */
async function listStories(args) {
  const options = parseOptions(args, {
    query: { flag: '--query', hasValue: true },
    limit: { flag: '--limit', hasValue: true }
  });
  
  const rallyClient = new RallyClient();
  
  try {
    console.log('Fetching user stories from Rally...');
    const stories = await rallyClient.getUserStories(options.query);
    
    const limit = options.limit ? parseInt(options.limit, 10) : stories.length;
    const displayStories = stories.slice(0, limit);
    
    console.log(`\n=== Found ${stories.length} stories ===`);
    displayStories.forEach((story, index) => {
      console.log(`${index + 1}. ${story.FormattedID}: ${story.Name}`);
    });
    
    if (stories.length > limit) {
      console.log(`\n...and ${stories.length - limit} more stories.`);
    }
  } catch (error) {
    console.error('Error listing stories:', error.message);
    process.exit(1);
  }
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
Rally Integration CLI

Usage:
  rally-cli <command> [options]

Commands:
  generate-tests      Generate feature files from Rally user stories
    Options:
      --query <query>  Rally query to filter stories
      --force          Force regeneration of all stories
      
  fetch-story <id>    Fetch and display a specific user story
  
  list-stories        List user stories from Rally
    Options:
      --query <query>  Rally query to filter stories
      --limit <num>    Limit the number of stories displayed
      
  help                Show this help message

Examples:
  rally-cli generate-tests --query "(ScheduleState = Defined)"
  rally-cli fetch-story US123
  rally-cli list-stories --limit 10

Required environment variables in .env file:
  RALLY_API_KEY       API key for Rally
  RALLY_WORKSPACE     Rally workspace reference
  RALLY_PROJECT       Rally project reference
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

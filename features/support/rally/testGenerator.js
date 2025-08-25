/**
 * Rally Test Generator
 * Fetches user stories from Rally and generates Gherkin feature files
 */
const fs = require('fs-extra');
const path = require('path');
const { promisify } = require('util');
const readline = require('readline');
const RallyClient = require('./rallyClient');
require('dotenv').config();

class RallyTestGenerator {
  constructor(config = {}) {
    this.rallyClient = new RallyClient(config);
    this.featuresDir = config.featuresDir || path.join(process.cwd(), 'features');
    this.rallyStoriesDir = path.join(this.featuresDir, 'rally-stories');
    this.metadataFile = path.join(this.featuresDir, 'rally-stories', '.metadata.json');
  }

  /**
   * Initialize directories
   */
  async initialize() {
    await fs.ensureDir(this.rallyStoriesDir);
    
    if (!await fs.pathExists(this.metadataFile)) {
      await fs.writeJson(this.metadataFile, { 
        lastSync: null,
        processedStories: {}
      });
    }
  }

  /**
   * Fetch stories from Rally and generate feature files
   * @param {Object} options - Options for story fetching
   * @param {string} options.query - Rally query to filter stories
   * @param {boolean} options.force - Force regeneration of all stories
   * @returns {Promise<Array>} - List of generated feature files
   */
  async generateFeatureFiles(options = {}) {
    await this.initialize();
    
    // Load metadata
    const metadata = await fs.readJson(this.metadataFile);
    const processedStories = metadata.processedStories || {};
    
    // Get stories from Rally
    const query = options.query || '';
    const stories = await this.rallyClient.getUserStories(query);
    
    if (!stories || stories.length === 0) {
      console.log('No stories found matching the query criteria');
      return [];
    }
    
    console.log(`Generating feature files for ${stories.length} user stories from Rally...`);
    
    const generatedFiles = [];
    
    for (const story of stories) {
      const storyId = story.FormattedID;
      const storyHash = this._hashStory(story);
      const isProcessed = processedStories[storyId] && processedStories[storyId].hash === storyHash;
      
      if (isProcessed && !options.force) {
        console.log(`Skipping story ${storyId} - no changes detected`);
        continue;
      }
      
      // Generate feature file
      const featureContent = await this._convertStoryToGherkin(story);
      const featureFileName = `${storyId.toLowerCase().replace(/[^\w]/g, '-')}.feature`;
      const featureFilePath = path.join(this.rallyStoriesDir, featureFileName);
      
      await fs.writeFile(featureFilePath, featureContent);
      
      // Update metadata
      processedStories[storyId] = {
        hash: storyHash,
        generatedAt: new Date().toISOString(),
        fileName: featureFileName
      };
      
      console.log(`Generated feature file: ${featureFileName}`);
      generatedFiles.push(featureFilePath);
    }
    
    // Update metadata
    metadata.lastSync = new Date().toISOString();
    metadata.processedStories = processedStories;
    await fs.writeJson(this.metadataFile, metadata, { spaces: 2 });
    
    return generatedFiles;
  }
  
  /**
   * Convert a Rally user story to Gherkin format
   * @param {Object} story - Rally user story
   * @returns {Promise<string>} - Gherkin feature content
   */
  async _convertStoryToGherkin(story) {
    console.log(`Converting story ${story.FormattedID} to Gherkin format`);
    
    // Basic feature structure
    let feature = `Feature: ${story.Name}\n`;
    
    // Add description from user story
    if (story.Description) {
      feature += `  ${story.Description.replace(/\\n/g, '\n  ')}\n\n`;
    } else {
      feature += `  As a user\n  I want to ${story.Name.toLowerCase()}\n\n`;
    }
    
    // Add metadata
    feature += `  @rally-story-${story.FormattedID}\n`;
    if (story._refObjectUUID) {
      feature += `  @rally-uuid-${story._refObjectUUID}\n`;
    }
    
    // Parse acceptance criteria into scenarios
    if (story.AcceptanceCriteria) {
      const scenarios = await this._parseAcceptanceCriteria(story.AcceptanceCriteria);
      feature += scenarios.join('\n\n');
    } else {
      // Create a basic scenario if no acceptance criteria
      feature += `  Scenario: Implement ${story.Name}\n`;
      feature += `    Given I need to implement "${story.Name}"\n`;
      feature += `    When the feature is complete\n`;
      feature += `    Then I should verify it meets requirements\n`;
    }
    
    return feature;
  }
  
  /**
   * Parse acceptance criteria into Gherkin scenarios
   * @param {string} criteria - Acceptance criteria text
   * @returns {Promise<Array<string>>} - Array of scenario strings
   */
  async _parseAcceptanceCriteria(criteria) {
    // Try to identify criteria that are already in a Given/When/Then format
    const scenarios = [];
    let currentScenario = null;
    let scenarioLines = [];
    
    // Clean up the criteria text
    const cleanedCriteria = criteria
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\\r\\n|\\n|\\r/g, '\n'); // Normalize line breaks
      
    // Split by lines
    const lines = cleanedCriteria.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        continue; // Skip empty lines
      }
      
      // Check if this is a scenario title
      if (trimmedLine.match(/^(scenario|test case|use case|example):/i)) {
        // Save previous scenario if exists
        if (currentScenario && scenarioLines.length > 0) {
          scenarios.push(this._formatScenario(currentScenario, scenarioLines));
        }
        
        // Start new scenario
        currentScenario = trimmedLine.replace(/^(scenario|test case|use case|example):/i, '').trim();
        scenarioLines = [];
      } 
      // Check for Given/When/Then patterns
      else if (trimmedLine.match(/^(given|when|then|and)/i)) {
        scenarioLines.push(trimmedLine);
      }
      // Otherwise, treat as part of the current scenario content
      else if (currentScenario) {
        scenarioLines.push(trimmedLine);
      }
      // If no current scenario, create one with this as the title
      else {
        currentScenario = 'Implement requirement';
        scenarioLines.push(trimmedLine);
      }
    }
    
    // Add the last scenario if it exists
    if (currentScenario && scenarioLines.length > 0) {
      scenarios.push(this._formatScenario(currentScenario, scenarioLines));
    }
    
    // If no clear scenarios were found, create a generic one
    if (scenarios.length === 0) {
      scenarios.push(
        `  Scenario: Implement acceptance criteria\n` +
        `    Given the acceptance criteria is "${cleanedCriteria.replace(/"/g, '\\"')}"\n` +
        `    When I implement the feature\n` +
        `    Then it should meet all requirements`
      );
    }
    
    return scenarios;
  }
  
  /**
   * Format a scenario from title and lines
   * @param {string} title - Scenario title
   * @param {Array<string>} lines - Scenario step lines
   * @returns {string} - Formatted scenario
   */
  _formatScenario(title, lines) {
    let scenario = `  Scenario: ${title}\n`;
    
    // Helper to format steps
    const formatStep = (line) => {
      // Clean up the line
      line = line.trim();
      
      // Skip empty lines
      if (!line) return null;
      
      // Try to format as Gherkin step
      if (line.match(/^(given|when|then|and)/i)) {
        const keyword = line.match(/^(given|when|then|and)/i)[0];
        const content = line.substring(keyword.length).trim();
        return `    ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} ${content}`;
      } else {
        // If the line doesn't start with a keyword, use appropriate one based on position
        if (lines.indexOf(line) === 0) {
          return `    Given ${line}`;
        } else if (lines.indexOf(line) === lines.length - 1) {
          return `    Then ${line}`;
        } else {
          return `    When ${line}`;
        }
      }
    };
    
    // Format all steps
    const formattedSteps = lines.map(formatStep).filter(Boolean);
    
    // If no steps, create placeholder steps
    if (formattedSteps.length === 0) {
      formattedSteps.push(
        `    Given I need to implement "${title}"`,
        `    When the implementation is complete`,
        `    Then it should work as expected`
      );
    }
    
    scenario += formattedSteps.join('\n');
    return scenario;
  }
  
  /**
   * Create a hash for a story to detect changes
   * @param {Object} story - Rally story object
   * @returns {string} - Hash string
   */
  _hashStory(story) {
    const fields = [
      story.Name || '',
      story.Description || '',
      story.AcceptanceCriteria || '',
      story.Notes || ''
    ];
    
    return fields.join('|').replace(/\\s+/g, ' ');
  }
  
  /**
   * Run CLI interface for the generator
   */
  static async runCli() {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const options = {
      query: '',
      force: false
    };
    
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--query' && i + 1 < args.length) {
        options.query = args[i + 1];
        i++;
      } else if (args[i] === '--force') {
        options.force = true;
      } else if (args[i] === '--help') {
        console.log('Rally Test Generator');
        console.log('Usage: node testGenerator.js [options]');
        console.log('Options:');
        console.log('  --query <query>    Rally query to filter stories');
        console.log('  --force            Force regeneration of all stories');
        console.log('  --help             Show this help message');
        return;
      }
    }
    
    // Initialize and run generator
    const generator = new RallyTestGenerator();
    try {
      const files = await generator.generateFeatureFiles(options);
      console.log(`Successfully generated ${files.length} feature files from Rally stories`);
    } catch (error) {
      console.error('Error generating feature files:', error.message);
      process.exit(1);
    }
  }
}

// Run CLI if called directly
if (require.main === module) {
  RallyTestGenerator.runCli();
}

module.exports = RallyTestGenerator;

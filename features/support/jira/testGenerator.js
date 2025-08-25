/**
 * JIRA Test Generator
 * Fetches user stories from JIRA and generates Gherkin feature files
 */
const fs = require('fs-extra');
const path = require('path');
const JiraClient = require('./jiraClient');
require('dotenv').config();

class JiraTestGenerator {
  constructor(config = {}) {
    this.jiraClient = new JiraClient(config);
    this.featuresDir = config.featuresDir || path.join(process.cwd(), 'features');
    this.jiraStoriesDir = path.join(this.featuresDir, 'jira-stories');
    this.metadataFile = path.join(this.featuresDir, 'jira-stories', '.metadata.json');
  }

  /**
   * Initialize directories
   */
  async initialize() {
    await fs.ensureDir(this.jiraStoriesDir);
    
    if (!await fs.pathExists(this.metadataFile)) {
      await fs.writeJson(this.metadataFile, { 
        lastSync: null,
        processedStories: {}
      });
    }
  }

  /**
   * Fetch stories from JIRA and generate feature files
   * @param {Object} options - Options for story fetching
   * @param {string} options.jql - JQL query to filter stories
   * @param {boolean} options.force - Force regeneration of all stories
   * @returns {Promise<Array>} - List of generated feature files
   */
  async generateFeatureFiles(options = {}) {
    await this.initialize();
    
    // Load metadata
    const metadata = await fs.readJson(this.metadataFile);
    const processedStories = metadata.processedStories || {};
    
    // Get stories from JIRA
    const jql = options.jql || '';
    const issues = await this.jiraClient.getUserStories(jql);
    
    if (!issues || issues.length === 0) {
      console.log('No stories found matching the JQL criteria');
      return [];
    }
    
    console.log(`Generating feature files for ${issues.length} user stories from JIRA...`);
    
    const generatedFiles = [];
    
    for (const issue of issues) {
      const issueKey = issue.key;
      const issueHash = this._hashIssue(issue);
      const isProcessed = processedStories[issueKey] && processedStories[issueKey].hash === issueHash;
      
      if (isProcessed && !options.force) {
        console.log(`Skipping story ${issueKey} - no changes detected`);
        continue;
      }
      
      // Generate feature file
      const featureContent = await this._convertIssueToGherkin(issue);
      const featureFileName = `${issueKey.toLowerCase().replace(/[^\w]/g, '-')}.feature`;
      const featureFilePath = path.join(this.jiraStoriesDir, featureFileName);
      
      await fs.writeFile(featureFilePath, featureContent);
      
      // Update metadata
      processedStories[issueKey] = {
        hash: issueHash,
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
   * Convert a JIRA issue to Gherkin format
   * @param {Object} issue - JIRA issue
   * @returns {Promise<string>} - Gherkin feature content
   */
  async _convertIssueToGherkin(issue) {
    console.log(`Converting issue ${issue.key} to Gherkin format`);
    
    const fields = issue.fields;
    
    // Basic feature structure
    let feature = `Feature: ${fields.summary}\n`;
    
    // Add description from user story
    if (fields.description) {
      const description = this.jiraClient._extractTextFromADF(fields.description);
      if (description) {
        feature += `  ${description.replace(/\n/g, '\n  ')}\n\n`;
      } else {
        feature += `  As a user\n  I want to ${fields.summary.toLowerCase()}\n\n`;
      }
    } else {
      feature += `  As a user\n  I want to ${fields.summary.toLowerCase()}\n\n`;
    }
    
    // Add metadata tags
    feature += `  @jira-story-${issue.key}\n`;
    if (issue.id) {
      feature += `  @jira-id-${issue.id}\n`;
    }
    
    // Add priority and status tags
    if (fields.priority) {
      feature += `  @priority-${fields.priority.name.toLowerCase().replace(/\s+/g, '-')}\n`;
    }
    if (fields.status) {
      feature += `  @status-${fields.status.name.toLowerCase().replace(/\s+/g, '-')}\n`;
    }
    
    // Add component tags
    if (fields.components && fields.components.length > 0) {
      fields.components.forEach(component => {
        feature += `  @component-${component.name.toLowerCase().replace(/\s+/g, '-')}\n`;
      });
    }
    
    // Add labels as tags
    if (fields.labels && fields.labels.length > 0) {
      fields.labels.forEach(label => {
        feature += `  @${label.toLowerCase().replace(/\s+/g, '-')}\n`;
      });
    }
    
    feature += '\n';
    
    // Parse acceptance criteria into scenarios
    const acceptanceCriteria = this.jiraClient.getAcceptanceCriteria(issue);
    if (acceptanceCriteria) {
      const scenarios = await this._parseAcceptanceCriteria(acceptanceCriteria);
      feature += scenarios.join('\n\n');
    } else {
      // Create a basic scenario if no acceptance criteria
      feature += `  Scenario: Implement ${fields.summary}\n`;
      feature += `    Given I need to implement "${fields.summary}"\n`;
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
    const scenarios = [];
    let currentScenario = null;
    let scenarioLines = [];
    
    // Clean up the criteria text
    const cleanedCriteria = criteria
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\r\n|\n|\r/g, '\n'); // Normalize line breaks
      
    // Split by lines
    const lines = cleanedCriteria.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        continue; // Skip empty lines
      }
      
      // Check if this is a scenario title
      if (trimmedLine.match(/^(scenario|test case|use case|example|acceptance criteria):/i)) {
        // Save previous scenario if exists
        if (currentScenario && scenarioLines.length > 0) {
          scenarios.push(this._formatScenario(currentScenario, scenarioLines));
        }
        
        // Start new scenario
        currentScenario = trimmedLine.replace(/^(scenario|test case|use case|example|acceptance criteria):/i, '').trim();
        scenarioLines = [];
      } 
      // Check for Given/When/Then patterns
      else if (trimmedLine.match(/^(given|when|then|and|but)/i)) {
        scenarioLines.push(trimmedLine);
      }
      // Check for bullet points or numbered lists
      else if (trimmedLine.match(/^(\*|-|\d+\.)\s+/)) {
        const cleanLine = trimmedLine.replace(/^(\*|-|\d+\.)\s+/, '');
        if (cleanLine.match(/^(given|when|then|and|but)/i)) {
          scenarioLines.push(cleanLine);
        } else {
          scenarioLines.push(cleanLine);
        }
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
    const formatStep = (line, index) => {
      // Clean up the line
      line = line.trim();
      
      // Skip empty lines
      if (!line) return null;
      
      // Try to format as Gherkin step
      if (line.match(/^(given|when|then|and|but)/i)) {
        const keyword = line.match(/^(given|when|then|and|but)/i)[0];
        const content = line.substring(keyword.length).trim();
        return `    ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} ${content}`;
      } else {
        // If the line doesn't start with a keyword, use appropriate one based on position
        if (index === 0) {
          return `    Given ${line}`;
        } else if (index === lines.length - 1) {
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
   * Create a hash for an issue to detect changes
   * @param {Object} issue - JIRA issue object
   * @returns {string} - Hash string
   */
  _hashIssue(issue) {
    const fields = issue.fields;
    const hashFields = [
      fields.summary || '',
      this.jiraClient._extractTextFromADF(fields.description) || '',
      this.jiraClient.getAcceptanceCriteria(issue) || '',
      fields.updated || ''
    ];
    
    return hashFields.join('|').replace(/\s+/g, ' ');
  }
  
  /**
   * Run CLI interface for the generator
   */
  static async runCli() {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const options = {
      jql: '',
      force: false
    };
    
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--jql' && i + 1 < args.length) {
        options.jql = args[i + 1];
        i++;
      } else if (args[i] === '--force') {
        options.force = true;
      } else if (args[i] === '--help') {
        console.log('JIRA Test Generator');
        console.log('Usage: node testGenerator.js [options]');
        console.log('Options:');
        console.log('  --jql <jql>        JQL query to filter stories');
        console.log('  --force            Force regeneration of all stories');
        console.log('  --help             Show this help message');
        return;
      }
    }
    
    // Initialize and run generator
    const generator = new JiraTestGenerator();
    try {
      const files = await generator.generateFeatureFiles(options);
      console.log(`Successfully generated ${files.length} feature files from JIRA stories`);
    } catch (error) {
      console.error('Error generating feature files:', error.message);
      process.exit(1);
    }
  }
}

// Run CLI if called directly
if (require.main === module) {
  JiraTestGenerator.runCli();
}

module.exports = JiraTestGenerator;

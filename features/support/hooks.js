const { Before, After, BeforeAll, AfterAll, setDefaultTimeout, Status } = require('@cucumber/cucumber');
const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs-extra');
const path = require('path');
const { PageObjectManager } = require('./pageObjectManager');
// Temporarily comment out for login tests
// const advancedReporting = require('./reporting/advancedReporting');
// const performanceMetricsCollector = require('./reporting/performanceMetricsCollector');
const RallyClient = require('./rally/rallyClient');
const JiraClient = require('./jira/jiraClient');
require('dotenv').config();

// Set default timeout
setDefaultTimeout(parseInt(process.env.TIMEOUT) || 30000);

// Global variables
let browser;
let context;
let page;

// Browser configuration
const browserConfig = {
  headless: process.env.HEADLESS === 'true',
  slowMo: parseInt(process.env.SLOW_MO) || 0,
  viewport: {
    width: parseInt(process.env.VIEWPORT_WIDTH) || 1920,
    height: parseInt(process.env.VIEWPORT_HEIGHT) || 1080
  }
};

// Context configuration
const contextConfig = {
  recordVideo: {
    dir: './test-results/videos/',
    size: { width: 1920, height: 1080 }
  },
  recordHar: {
    path: './test-results/network.har'
  }
};

BeforeAll(async function () {
  // Ensure directories exist
  await fs.ensureDir('./test-results');
  await fs.ensureDir('./test-results/videos');
  await fs.ensureDir('./test-results/screenshots');
  await fs.ensureDir('./test-results/traces');
  await fs.ensureDir('./reports');
  
  // Temporarily comment out for login tests
  // await fs.ensureDir('./reports/dashboard');
  // await fs.ensureDir('./reports/history');
  
  // Initialize advanced reporting
  // await advancedReporting.initializeDb();
  
  console.log('🚀 Starting Intelligent_Automation Framework...');
});

Before(async function (scenario) {
  // Store test case title for reporting
  this.testCaseTitle = scenario.pickle.name;

  // Launch browser
  const browserType = process.env.BROWSER || 'chromium';
  
  switch (browserType) {
    case 'firefox':
      browser = await firefox.launch(browserConfig);
      break;
    case 'webkit':
      browser = await webkit.launch(browserConfig);
      break;
    default:
      browser = await chromium.launch(browserConfig);
  }
  
  // Create context
  context = await browser.newContext({
    ...contextConfig,
    recordVideo: process.env.VIDEO === 'on' || process.env.VIDEO === 'retain-on-failure' ? contextConfig.recordVideo : undefined
  });
  
  // Start tracing
  if (process.env.TRACE === 'on' || process.env.TRACE === 'retain-on-failure') {
    await context.tracing.start({ screenshots: true, snapshots: true });
  }
  
  // Create page
  page = await context.newPage();
  
  // Expose page globally
  this.page = page;
  this.context = context;
  this.browser = browser;
  
  // Initialize page object manager
  this.pageObjectManager = new PageObjectManager(page);
  
  console.log(`📄 Starting scenario: ${scenario.pickle.name}`);
});

After(async function (scenario) {
  let screenshotPath;
  let tracePath;

  // Take screenshot on failure
  if (scenario.result.status === 'FAILED') {
    const timestamp = Date.now();
    const scenarioName = scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_');
    
    // Create screenshot
    screenshotPath = path.resolve(`./test-results/screenshots/${scenarioName}_${timestamp}.png`);
    const screenshot = await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    this.attach(screenshot, 'image/png');
    
    // Save trace on failure
    if (process.env.TRACE === 'on' || process.env.TRACE === 'retain-on-failure') {
      tracePath = path.resolve(`./test-results/traces/${scenarioName}_${timestamp}.zip`);
      await context.tracing.stop({ path: tracePath });
    }
    
    // Log defect in Rally if enabled
    if (process.env.RALLY_ENABLED === 'true') {
      try {
        const rallyClient = new RallyClient();
        
        // Extract Rally story ID from tags if available
        let storyID;
        for (const tag of scenario.pickle.tags) {
          const match = tag.name.match(/^@rally-story-(.+)$/);
          if (match) {
            storyID = match[1];
            break;
          }
        }
        
        // Get error message from scenario
        const errorMessage = scenario.result.message || 'Test failed';
        
        // Create defect data
        const defectData = {
          name: `Test Failure: ${scenario.pickle.name}`,
          description: `Automated test failed: ${scenario.pickle.name}\n\nError: ${errorMessage}`,
          severity: 'Medium',
          priority: 'Medium',
          environment: process.env.TEST_ENVIRONMENT || 'Test',
          storyID: storyID,
          reproducibleSteps: this._formatReproSteps(scenario),
          screenshotPath: screenshotPath
        };
        
        // Log defect in Rally
        console.log('Logging defect in Rally...');
        const defect = await rallyClient.createDefect(defectData);
        console.log(`Rally defect created: ${defect.FormattedID}`);
        
        // Attach trace file if available
        if (tracePath) {
          await rallyClient.attachFileToDefect(defect._ref, tracePath);
        }
      } catch (error) {
        console.error('Error logging defect in Rally:', error.message);
      }
    }
    
    // Log defect in JIRA if enabled
    if (process.env.JIRA_ENABLED === 'true') {
      try {
        const jiraClient = new JiraClient();
        
        // Extract JIRA story key from tags if available
        let storyKey;
        for (const tag of scenario.pickle.tags) {
          const match = tag.name.match(/^@jira-story-(.+)$/);
          if (match) {
            storyKey = match[1];
            break;
          }
        }
        
        // Get error message from scenario
        const errorMessage = scenario.result.message || 'Test failed';
        
        // Create defect data
        const defectData = {
          summary: `Test Failure: ${scenario.pickle.name}`,
          description: `Automated test failed: ${scenario.pickle.name}\n\nError: ${errorMessage}\n\nEnvironment: ${process.env.TEST_ENVIRONMENT || 'Test'}`,
          priority: 'Medium',
          environment: process.env.TEST_ENVIRONMENT || 'Test',
          storyKey: storyKey,
          reproducibleSteps: _formatReproSteps(scenario),
          screenshotPath: screenshotPath
        };
        
        // Log defect in JIRA
        console.log('Logging defect in JIRA...');
        const defect = await jiraClient.createDefect(defectData);
        console.log(`JIRA defect created: ${defect.key}`);
        
        // Attach trace file if available
        if (tracePath) {
          await jiraClient.attachFileToIssue(defect.key, tracePath);
        }
      } catch (error) {
        console.error('Error logging defect in JIRA:', error.message);
      }
    }
  } else {
    // Stop tracing without saving on success
    if (process.env.TRACE === 'on' || process.env.TRACE === 'retain-on-failure') {
      await context.tracing.stop();
    }
  }
  
  // Close context and browser
  await context.close();
  await browser.close();
  
  console.log(`✅ Completed scenario: ${scenario.pickle.name} - Status: ${scenario.result.status}`);
});

AfterAll(async function () {
  console.log('🏁 Intelligent_Automation Framework execution completed!');
});

/**
 * Format reproducible steps from a scenario
 * @param {Object} scenario - Cucumber scenario
 * @returns {string} - Formatted steps
 */
function _formatReproSteps(scenario) {
  let steps = 'Steps to reproduce:\n\n';
  
  // Add feature and scenario name
  steps += `Feature: ${scenario.gherkinDocument.feature.name}\n`;
  steps += `Scenario: ${scenario.pickle.name}\n\n`;
  
  // Add steps
  scenario.pickle.steps.forEach((step, index) => {
    steps += `${index + 1}. ${step.text}\n`;
  });
  
  return steps;
}

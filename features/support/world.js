const ReportGenerator = require('./reportGenerator');
const { setWorldConstructor } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');
const PageObjectManager = require('./pageObjectManager');

// Import API and DB clients
const ApiClient = require('./api/apiClient');
const DbClient = require('./db/dbClient');
const RallyClient = require('./rally/rallyClient');
const JiraClient = require('./jira/jiraClient');

// World class definition
class CustomWorld {
  constructor({ attach, parameters }) {
    this.attach = attach;
    this.parameters = parameters;
    this.browser = null;
    this.context = null;
    this.page = null;
    this.pageObjectManager = null;
    // Initialize Rally client if enabled
    this.rallyClient = process.env.RALLY_ENABLED === 'true' ? new RallyClient() : null;
    
    // Initialize JIRA client if enabled
    this.jiraClient = process.env.JIRA_ENABLED === 'true' ? new JiraClient() : null;
    this.rallyClient = process.env.RALLY_ENABLED === 'true' ? new RallyClient() : null;
    
    // API and DB testing properties
    this.apiClient = null;
    this.dbClient = null;
    this.queryResults = null;
    this.updateResult = null;
    this.variables = {};
  }

  async init() {
    // Initialize browser if not already initialized
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        slowMo: 50
      });
    }
    
    // Create a new browser context for each scenario
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: { dir: 'reports/videos/' }
    });
    
    // Create a new page for each scenario
    this.page = await this.context.newPage();
    
    // Initialize page object manager
    this.pageObjectManager = new PageObjectManager(this.page);
  }

  async cleanup() {
    // Cleanup browser resources
    if (this.page) {
      await this.page.close();
    }
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Register the world constructor
setWorldConstructor(CustomWorld);

// Generate reports after test execution
process.on('exit', async () => {
  console.log('\n🎯 Generating test reports...');
  
  try {
    await ReportGenerator.generateTestSummary();
    await ReportGenerator.generateHtmlReport();
    await ReportGenerator.cleanupOldReports(7); // Keep reports for 7 days
  } catch (error) {
    console.error('Error in report generation:', error);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = {};

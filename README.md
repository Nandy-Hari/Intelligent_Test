# Intelligent_Automation

A comprehensive Playwright-based BDD framework that allows you to write automated tests using only Gherkin feature files - no coding required! Featuring self-healing test automation with intelligent selector strategies.

## 🚀 Features

- **Intelligent Test Automation**: Write tests using only Gherkin feature files
- **Self-Healing Tests**: Smart selectors that adapt to UI changes
- **Cross-Browser Support**: Chromium, Firefox, and WebKit
- **Adaptive Element Selection**: Resilient tests that work despite UI changes
- **Rich Step Library**: Comprehensive collection of pre-built step definitions
- **API Testing**: Built-in REST API testing with JSON schema validation
- **Database Testing**: Support for MySQL, PostgreSQL, SQLite, and MS SQL
- **Visual Testing**: Automatic screenshots and video recording
- **Performance Monitoring**: Built-in performance assertions
- **Parallel Execution**: Run tests in parallel for faster execution
- **Advanced Reporting**: Interactive dashboards, PDF reports, historical trends, and email notifications
- **CI/CD Ready**: Easy integration with any CI/CD pipeline

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key (for AI test generation)

## 🛠️ Installation

1. Clone or download this framework
2. Install dependencies:
   ```bash
   npm run setup
   ```

3. Set up the environment for AI test generation:
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file to add your OpenAI API key.

This will install all dependencies, Playwright browsers, and system dependencies.

## 🎯 Quick Start

1. **Run all tests:**
   ```bash
   npm test
   ```

2. **Run tests with HTML report:**
   ```bash
   npm run test:html
   ```

3. **Run tests in parallel:**
   ```bash
   npm run test:parallel
   ```

4. **Run specific feature:**
   ```bash
   npx cucumber-js features/google-search.feature
   ```

5. **Run tests with specific tags:**
   ```bash
   npx cucumber-js --tags "@smoke"
   ```
   
6. **Run API tests:**
   ```bash
   npm run test:api
   ```

7. **Run database tests:**
   ```bash
   npm run test:db
   ```

8. **Generate advanced reports:**
   ```bash
   npm run report:generate
   ```

## 📁 Project Structure

```
├── features/
│   ├── google-search.feature       # Google search scenarios
│   ├── github-search.feature       # GitHub repository scenarios  
│   ├── amazon-search.feature       # Amazon product scenarios
│   ├── intelligent-automation-demo.feature      # Framework demo scenarios
│   ├── page-objects/               # Page object classes
│   │   ├── GooglePage.js
│   │   ├── GitHubPage.js
│   │   └── AmazonPage.js
│   ├── step-definitions/           # Step definition files
│   │   ├── commonSteps.js          # Common action steps
│   │   └── verificationSteps.js    # Verification steps
│   └── support/                    # Support files
│       ├── hooks.js                # Before/After hooks
│       ├── pageObjectManager.js    # Page object management
│       ├── reportGenerator.js      # Report generation
│       └── world.js                # World configuration
├── reports/                        # Test reports
├── scripts/                        # Utility scripts
│   └── generateTests.js           # AI test generator script
├── test-results/                   # Screenshots, videos, traces
├── .env                           # Environment configuration
├── cucumber.js                    # Cucumber configuration
└── package.json                   # Project dependencies
```

## 🧠 AI Test Generation

Our framework includes an AI-powered test generator that can create feature files, page objects, and step definitions from user stories.

### Generate tests from a user story

```bash
npm run generate -- --story "As a user, I want to login to saucedemo with valid credentials so that I can access my account"
```

### Generate from multiple user stories

```bash
npm run generate -- --file sample-stories.txt
```

### Generate complete test artifacts (features, page objects, steps)

```bash
npm run generate:all -- --story "As a user, I want to filter products by price so that I can find the cheapest items"
```

See `scripts/README.md` for more details on the test generator.

## ✨ Available Step Definitions

### Navigation Steps
```gherkin
Given I am on the "Google" page
Given I navigate to "https://example.com"
Given I go to "https://example.com"
```

### Interaction Steps
```gherkin
When I click on "Search"
When I click the "Submit" button
When I click the "Home" link
When I enter "test" in the "username" field
When I type "hello world"
When I press "Enter"
When I search for "playwright"
```

### Wait Steps
```gherkin
When I wait for 5 seconds
When I wait for "Loading" to be visible
When I wait for page to load
```

### Scroll Steps
```gherkin
When I scroll down
When I scroll up
When I scroll to "Footer"
```

### Form Steps
```gherkin
When I select "Option 1" from "dropdown" dropdown
When I upload file "test.pdf" to "file-upload"
```

### Verification Steps
```gherkin
Then I should see "Welcome"
Then I should not see "Error"
Then the page title should be "Home Page"
Then the page title should contain "Home"
Then the URL should be "https://example.com"
Then the URL should contain "home"
Then the "Submit" element should be visible
Then the "Submit" button should be enabled
Then the "username" field should contain "john"
Then I should see at least 5 search results
```

### Screenshot Steps
```gherkin
Then I take a screenshot named "homepage"
```

## 🎭 Supported Websites

The framework comes with built-in support for:

- **Google**: Search functionality, navigation
- **GitHub**: Repository search, navigation  
- **Amazon**: Product search, cart operations

### Google Search Example
```gherkin
Feature: Google Search
  Scenario: Search for information
    Given I am on the "Google" page
    When I search for "Playwright"
    Then I should see Google search results
    And I should see "Playwright"
```

### GitHub Repository Search Example
```gherkin
Feature: GitHub Search
  Scenario: Find repositories
    Given I am on the "GitHub" page
    When I search for "playwright"
    Then I should see GitHub repositories
    And I should see "microsoft/playwright"
```

### Amazon Product Search Example
```gherkin
Feature: Amazon Shopping
  Scenario: Search for products
    Given I am on the "Amazon" page
    When I search for "laptop"
    Then I should see Amazon products
    And I should see at least 10 items
```

## ⚙️ Configuration

### Environment Variables (.env)
```env
BROWSER=chromium           # chromium, firefox, webkit
HEADLESS=false            # true, false
VIEWPORT_WIDTH=1920       # Browser width
VIEWPORT_HEIGHT=1080      # Browser height
TIMEOUT=30000            # Default timeout in ms
BASE_URL=https://example.com
SLOW_MO=100             # Slow down operations
VIDEO=retain-on-failure  # on, off, retain-on-failure
SCREENSHOT=only-on-failure # on, off, only-on-failure
TRACE=retain-on-failure   # on, off, retain-on-failure
```

### Cucumber Configuration (cucumber.js)
```javascript
module.exports = {
  default: {
    require: [
      'features/step-definitions/*.js',
      'features/support/*.js'
    ],
    format: [
      'progress-bar',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json'
    ],
    parallel: 1,    // Number of parallel workers
    retry: 1,       // Retry failed scenarios
    timeout: 60000  // Step timeout
  }
};
```

## 🏷️ Tags and Organization

Use tags to organize and run specific test groups:

```gherkin
@smoke @critical
Scenario: Critical user journey
  # Test steps here

@regression @slow
Scenario: Comprehensive test
  # Test steps here
```

Run tests by tags:
```bash
npx cucumber-js --tags "@smoke"
npx cucumber-js --tags "@smoke and @critical"
npx cucumber-js --tags "not @slow"
```

## 📊 Reports and Artifacts

### HTML Reports
After test execution, find reports in:
- `./reports/cucumber-html-report.html` - Detailed HTML report
- `./reports/test-summary.json` - Test execution summary

### Test Artifacts
- `./test-results/screenshots/` - Screenshots (on failure)
- `./test-results/videos/` - Video recordings
- `./test-results/traces/` - Playwright traces for debugging

## 🔧 Advanced Usage

### Adding New Websites
1. Create a new page object in `features/page-objects/`
2. Follow the existing pattern extending `BasePage`
3. Add the page to `pageObjectManager.js`

### Custom Step Definitions
Add new steps to existing files or create new ones in `features/step-definitions/`

### Environment-Specific Testing
Create multiple .env files:
- `.env.dev`
- `.env.staging` 
- `.env.prod`

Load specific environment:
```bash
NODE_ENV=staging npm test
```

## 🎯 Best Practices

1. **Use meaningful scenario names** that describe the business value
2. **Keep scenarios focused** - one scenario per user journey
3. **Use tags** to organize tests by priority, type, or feature
4. **Write scenarios in business language** - avoid technical details
5. **Use Background** for common setup steps
6. **Use Scenario Outline** for data-driven testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your enhancements
4. Submit a pull request

## 📝 License

MIT License - feel free to use this framework for your projects!

## 🆘 Troubleshooting

### Common Issues

1. **Browser not found**: Run `npm run install:browsers`
2. **Permission errors**: Run `npm run install:deps`
3. **Step definition not found**: Check step-definitions folder
4. **Timeout errors**: Increase timeout in .env or cucumber.js

### Getting Help

- Check the console output for detailed error messages
- Look at screenshots and traces in test-results folder
- Enable debug mode by setting `DEBUG=pw:api` environment variable

## 📊 Advanced Reporting

Intelligent_Automation includes a comprehensive reporting system:

### Interactive Dashboards
```bash
npm run report:dashboard
```
Generates an interactive HTML dashboard with:
- Test execution statistics
- Pass/fail charts
- Historical trends
- Performance metrics visualization
- Failure analysis

### PDF Reports
```bash
npm run report:pdf
```
Creates a PDF report suitable for sharing with stakeholders, containing:
- Summary statistics
- Feature-by-feature breakdown
- Detailed scenario results
- Failure information

### Email Notifications
```bash
npm run report:email
```
Sends email notifications with:
- Test execution summary
- Pass rate and key metrics
- Links to full reports
- Optional attachments (PDF reports, dashboard)

### Historical Trends
The framework automatically stores test results in a SQLite database, enabling:
- Analysis of pass rates over time
- Identification of flaky tests
- Performance trend analysis
- Comparison across environments

### Setup Email Notifications
1. Configure email settings in your `.env` file:
```
ENABLE_EMAIL_REPORTS=true
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
EMAIL_FROM=automation@yourcompany.com
EMAIL_RECIPIENTS=team1@example.com,team2@example.com
```

2. Run tests with email reporting:
```bash
npm test && npm run report:email
```

---

🎉 **Happy Testing with Intelligent_Automation Framework!**

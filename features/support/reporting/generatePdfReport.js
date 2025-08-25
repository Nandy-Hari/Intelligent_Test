/**
 * PDF Report Generator for Intelligent_Automation framework
 * Generates PDF reports from test results
 */
const fs = require('fs-extra');
const path = require('path');
const htmlPdf = require('html-pdf-node');
const handlebars = require('handlebars');
require('dotenv').config();

// Import advanced reporting
const AdvancedReporting = require('./advancedReporting');
const advancedReporting = new AdvancedReporting();

/**
 * Generate PDF report from test results
 */
async function generatePdfReport() {
  try {
    console.log('Generating PDF report...');
    
    // Get latest test run ID
    await advancedReporting.initializeDb();
    const latestRun = await advancedReporting.db.get('SELECT run_id FROM test_runs ORDER BY timestamp DESC LIMIT 1');
    
    if (!latestRun) {
      console.error('No test runs found in database');
      process.exit(1);
    }
    
    // Generate report data
    const runId = latestRun.run_id;
    const testRun = await advancedReporting.db.get('SELECT * FROM test_runs WHERE run_id = ?', [runId]);
    const scenarios = await advancedReporting.db.all('SELECT * FROM scenarios WHERE run_id = ?', [runId]);
    
    // Get steps for each scenario
    for (const scenario of scenarios) {
      scenario.steps = await advancedReporting.db.all('SELECT * FROM steps WHERE scenario_id = ?', [scenario.scenario_id]);
    }
    
    // Group scenarios by feature
    const features = {};
    scenarios.forEach(scenario => {
      const featureName = scenario.feature_name;
      if (!features[featureName]) {
        features[featureName] = {
          name: featureName,
          file: scenario.feature_file,
          scenarios: []
        };
      }
      features[featureName].scenarios.push(scenario);
    });
    
    // Calculate statistics
    const stats = {
      total: testRun.total_scenarios,
      passed: testRun.passed_scenarios,
      failed: testRun.failed_scenarios,
      skipped: testRun.skipped_scenarios,
      ambiguous: testRun.ambiguous_scenarios,
      duration: Math.round(testRun.duration / 1000), // seconds
      passRate: Math.round((testRun.passed_scenarios / testRun.total_scenarios) * 100),
      environment: testRun.environment || 'Unknown',
      browser: testRun.browser || 'Unknown',
      timestamp: new Date(testRun.timestamp).toLocaleString(),
      features: Object.values(features)
    };
    
    // Read the HTML template
    const templateFile = path.join(__dirname, 'templates', 'pdf-report-template.html');
    let templateContent;
    
    try {
      templateContent = await fs.readFile(templateFile, 'utf8');
    } catch (err) {
      console.log('PDF template not found, creating default template');
      // Create template directory if it doesn't exist
      await fs.ensureDir(path.join(__dirname, 'templates'));
      
      // Default template
      templateContent = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: #4b0082; color: white; padding: 20px; text-align: center; }
    .summary { display: flex; justify-content: space-between; margin: 20px 0; flex-wrap: wrap; }
    .summary-item { text-align: center; padding: 10px; border-radius: 5px; margin: 5px; flex: 1; min-width: 100px; }
    .pass { background-color: #dff0d8; color: #3c763d; }
    .fail { background-color: #f2dede; color: #a94442; }
    .skip { background-color: #fcf8e3; color: #8a6d3b; }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    .table th { background-color: #f2f2f2; }
    .failed-row { background-color: #ffeeee; }
    .passed-row { background-color: #eeffee; }
    .skipped-row { background-color: #ffffee; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
    .feature-header { background-color: #eee; padding: 10px; margin: 20px 0 10px 0; border-left: 4px solid #4b0082; }
    .scenario { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
    .scenario-name { font-weight: bold; }
    .scenario.passed { border-left: 4px solid green; }
    .scenario.failed { border-left: 4px solid red; }
    .scenario.skipped { border-left: 4px solid orange; }
    .steps { margin-left: 20px; }
    .step { margin: 5px 0; }
    .step.passed { color: green; }
    .step.failed { color: red; font-weight: bold; }
    .step.skipped { color: orange; }
    .error-message { background-color: #fff0f0; padding: 10px; border-left: 2px solid red; margin: 5px 0 5px 20px; font-family: monospace; font-size: 12px; overflow-x: auto; }
    .page-break { page-break-after: always; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Intelligent Automation Test Report</h1>
    <p>Run Date: {{timestamp}}</p>
  </div>
  
  <h2>Test Summary</h2>
  <div class="summary">
    <div class="summary-item pass">
      <h3>Pass Rate</h3>
      <p>{{passRate}}%</p>
    </div>
    <div class="summary-item {{#if failed}}fail{{else}}pass{{/if}}">
      <h3>Total</h3>
      <p>{{total}} scenarios</p>
    </div>
    <div class="summary-item pass">
      <h3>Passed</h3>
      <p>{{passed}}</p>
    </div>
    <div class="summary-item fail">
      <h3>Failed</h3>
      <p>{{failed}}</p>
    </div>
    <div class="summary-item skip">
      <h3>Skipped</h3>
      <p>{{skipped}}</p>
    </div>
  </div>
  
  <h3>Test Environment</h3>
  <p>Environment: {{environment}} | Browser: {{browser}}</p>
  <p>Duration: {{duration}} seconds</p>
  
  <div class="page-break"></div>
  
  <h2>Feature Summary</h2>
  <table class="table">
    <thead>
      <tr>
        <th>Feature</th>
        <th>Total</th>
        <th>Passed</th>
        <th>Failed</th>
        <th>Skipped</th>
      </tr>
    </thead>
    <tbody>
      {{#each features}}
      <tr>
        <td>{{name}}</td>
        <td>{{scenarios.length}}</td>
        <td>{{countStatus scenarios "passed"}}</td>
        <td>{{countStatus scenarios "failed"}}</td>
        <td>{{countStatus scenarios "skipped"}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
  
  <div class="page-break"></div>
  
  <h2>Feature Details</h2>
  {{#each features}}
  <div class="feature-header">
    <h3>{{name}}</h3>
    <p>File: {{file}}</p>
  </div>
  
  {{#each scenarios}}
  <div class="scenario {{status}}">
    <div class="scenario-name">{{scenario_name}}</div>
    <div class="steps">
      {{#each steps}}
      <div class="step {{status}}">{{step_text}}</div>
      {{#if error_message}}
      <div class="error-message">{{error_message}}</div>
      {{/if}}
      {{/each}}
    </div>
  </div>
  {{/each}}
  
  {{#unless @last}}
  <div class="page-break"></div>
  {{/unless}}
  {{/each}}
  
  <div class="footer">
    <p>Generated by Intelligent Automation Framework</p>
  </div>
</body>
</html>`;
      
      // Save the default template
      await fs.writeFile(templateFile, templateContent);
    }
    
    // Register Handlebars helpers
    handlebars.registerHelper('countStatus', function(scenarios, status) {
      return scenarios.filter(s => s.status === status).length;
    });
    
    // Compile the template
    const template = handlebars.compile(templateContent);
    const html = template(stats);
    
    // Set PDF options
    const options = {
      format: 'A4',
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
      printBackground: true,
      preferCSSPageSize: true
    };
    
    // Generate PDF
    const file = { content: html };
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    
    // Save PDF to file
    const pdfPath = path.join(advancedReporting.reportDir, 'test-report.pdf');
    await fs.writeFile(pdfPath, pdfBuffer);
    
    console.log(`PDF report generated: ${pdfPath}`);
    await advancedReporting.db.close();
    
  } catch (error) {
    console.error('Error generating PDF report:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  generatePdfReport().catch(console.error);
}

module.exports = { generatePdfReport };

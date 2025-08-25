/**
 * Email reporting utility for Intelligent_Automation framework
 * Sends test results via email
 */
const nodemailer = require('nodemailer');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

// Import advanced reporting
const AdvancedReporting = require('./advancedReporting');
const advancedReporting = new AdvancedReporting();

/**
 * Send email with test results
 */
async function sendEmailReport() {
  try {
    console.log('Preparing email report...');
    
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
    const failedScenarios = scenarios.filter(s => s.status === 'failed');
    
    // Calculate pass rate
    const passRate = Math.round((testRun.passed_scenarios / testRun.total_scenarios) * 100);
    const environment = testRun.environment || 'Unknown';
    const browser = testRun.browser || 'Unknown';
    
    // Create HTML content
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .header { background: #4b0082; color: white; padding: 20px; text-align: center; }
        .summary { display: flex; justify-content: space-around; margin: 20px 0; }
        .summary-item { text-align: center; padding: 10px; border-radius: 5px; width: 150px; }
        .pass { background-color: #dff0d8; color: #3c763d; }
        .fail { background-color: #f2dede; color: #a94442; }
        .skip { background-color: #fcf8e3; color: #8a6d3b; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; }
        .table th { background-color: #f2f2f2; }
        .failed-row { background-color: #ffeeee; }
        .passed-row { background-color: #eeffee; }
        .skipped-row { background-color: #ffffee; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>Intelligent Automation Test Report</h2>
        <p>Run Date: ${new Date(testRun.timestamp).toLocaleString()}</p>
      </div>
      
      <div class="summary">
        <div class="summary-item pass">
          <h3>Pass Rate</h3>
          <p>${passRate}%</p>
        </div>
        <div class="summary-item ${testRun.failed_scenarios > 0 ? 'fail' : 'pass'}">
          <h3>Total</h3>
          <p>${testRun.total_scenarios} scenarios</p>
        </div>
        <div class="summary-item pass">
          <h3>Passed</h3>
          <p>${testRun.passed_scenarios}</p>
        </div>
        <div class="summary-item fail">
          <h3>Failed</h3>
          <p>${testRun.failed_scenarios}</p>
        </div>
        <div class="summary-item skip">
          <h3>Skipped</h3>
          <p>${testRun.skipped_scenarios}</p>
        </div>
      </div>
      
      <h3>Test Environment</h3>
      <p>Environment: ${environment} | Browser: ${browser}</p>
      <p>Duration: ${Math.round(testRun.duration / 1000)} seconds</p>
      
      <h3>Failed Scenarios (${failedScenarios.length})</h3>
      ${failedScenarios.length > 0 ? `
      <table class="table">
        <thead>
          <tr>
            <th>Feature</th>
            <th>Scenario</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          ${failedScenarios.map(scenario => `
          <tr class="failed-row">
            <td>${scenario.feature_name}</td>
            <td>${scenario.scenario_name}</td>
            <td>${scenario.error_message ? scenario.error_message.substring(0, 150) + '...' : 'N/A'}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
      ` : '<p>No failures reported.</p>'}
      
      <div class="footer">
        <p>This is an automated email from the Intelligent Automation Framework. Please do not reply.</p>
      </div>
    </body>
    </html>
    `;
    
    // Set up email configuration
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'user@example.com',
        pass: process.env.SMTP_PASS || 'password'
      }
    };
    
    // Create email recipients list
    const recipients = process.env.EMAIL_RECIPIENTS 
      ? process.env.EMAIL_RECIPIENTS.split(',') 
      : ['test-reports@example.com'];
    
    // Set up email transporter
    const transporter = nodemailer.createTransport(emailConfig);
    
    // Create email message
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'intelligent-automation@example.com',
      to: recipients.join(','),
      subject: `[${passRate}% Pass] Intelligent Automation Test Report - ${environment}`,
      html: htmlContent,
      attachments: []
    };
    
    // Check if dashboard HTML exists and attach it
    const dashboardPath = path.join(advancedReporting.dashboardDir, 'index.html');
    if (fs.existsSync(dashboardPath)) {
      mailOptions.attachments.push({
        filename: 'dashboard.html',
        path: dashboardPath
      });
    }
    
    // Check if cucumber report exists and attach it
    const cucumberReportPath = path.join(advancedReporting.reportDir, 'cucumber-report.html');
    if (fs.existsSync(cucumberReportPath)) {
      mailOptions.attachments.push({
        filename: 'cucumber-report.html',
        path: cucumberReportPath
      });
    }
    
    // Check for PDF report and attach if exists
    const pdfReportPath = path.join(advancedReporting.reportDir, 'test-report.pdf');
    if (fs.existsSync(pdfReportPath)) {
      mailOptions.attachments.push({
        filename: 'test-report.pdf',
        path: pdfReportPath
      });
    }
    
    // Check environment and only send if it's allowed
    if (process.env.ENABLE_EMAIL_REPORTS === 'true') {
      // Send email
      console.log('Sending email report...');
      await transporter.sendMail(mailOptions);
      console.log('Email report sent successfully!');
    } else {
      console.log('Email reports are disabled. Set ENABLE_EMAIL_REPORTS=true in .env to enable.');
      console.log('Email would have been sent to:', recipients.join(', '));
    }
    
    await advancedReporting.db.close();
    
  } catch (error) {
    console.error('Error sending email report:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  sendEmailReport().catch(console.error);
}

module.exports = { sendEmailReport };

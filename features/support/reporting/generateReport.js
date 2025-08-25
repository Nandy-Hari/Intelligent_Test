/**
 * Report Generator for Intelligent_Automation framework
 * Generates all report types in one command
 */
const { sendEmailReport } = require('./sendEmailReport');
const { generatePdfReport } = require('./generatePdfReport');
const { generateDashboard } = require('./generateDashboard');
const AdvancedReporting = require('./advancedReporting');
require('dotenv').config();

/**
 * Generate all report types
 */
async function generateAllReports() {
  try {
    console.log('Generating all reports...');
    
    // Initialize advanced reporting
    const advancedReporting = new AdvancedReporting();
    
    // Generate dashboard
    console.log('Generating dashboard...');
    await generateDashboard();
    
    // Generate PDF report
    console.log('Generating PDF report...');
    await generatePdfReport();
    
    // Send email report if enabled
    if (process.env.ENABLE_EMAIL_REPORTS === 'true') {
      console.log('Sending email report...');
      await sendEmailReport();
    } else {
      console.log('Email reports are disabled. Set ENABLE_EMAIL_REPORTS=true in .env to enable.');
    }
    
    console.log('All reports generated successfully!');
    
  } catch (error) {
    console.error('Error generating reports:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  generateAllReports().catch(console.error);
}

module.exports = { generateAllReports };

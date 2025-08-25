const cucumberHtmlReporter = require('cucumber-html-reporter');
const fs = require('fs-extra');
const path = require('path');

class ReportGenerator {
  static async generateHtmlReport() {
    const options = {
      theme: 'bootstrap',
      jsonFile: './reports/cucumber-report.json',
      output: './reports/cucumber-html-report.html',
      reportSuiteAsScenarios: true,
      scenarioTimestamp: true,
      launchReport: false,
      metadata: {
        "App Version": "1.0.0",
        "Test Environment": process.env.NODE_ENV || "QA",
        "Browser": process.env.BROWSER || "chromium",
        "Platform": process.platform,
        "Parallel": "Scenarios",
        "Executed": "Local"
      },
      failedSummaryReport: true,
    };

    try {
      await cucumberHtmlReporter.generate(options);
      console.log('✅ HTML report generated successfully at: ./reports/cucumber-html-report.html');
    } catch (error) {
      console.error('❌ Error generating HTML report:', error);
    }
  }

  static async generateTestSummary() {
    try {
      const jsonReportPath = './reports/cucumber-report.json';
      
      if (!await fs.pathExists(jsonReportPath)) {
        console.log('No JSON report found to generate summary');
        return;
      }

      const jsonReport = await fs.readJson(jsonReportPath);
      let totalScenarios = 0;
      let passedScenarios = 0;
      let failedScenarios = 0;
      let skippedScenarios = 0;
      
      jsonReport.forEach(feature => {
        feature.elements.forEach(scenario => {
          if (scenario.type === 'scenario') {
            totalScenarios++;
            const hasFailed = scenario.steps.some(step => step.result.status === 'failed');
            const hasSkipped = scenario.steps.some(step => step.result.status === 'skipped');
            
            if (hasFailed) {
              failedScenarios++;
            } else if (hasSkipped) {
              skippedScenarios++;
            } else {
              passedScenarios++;
            }
          }
        });
      });

      const summary = {
        total: totalScenarios,
        passed: passedScenarios,
        failed: failedScenarios,
        skipped: skippedScenarios,
        passRate: totalScenarios > 0 ? ((passedScenarios / totalScenarios) * 100).toFixed(2) : 0,
        timestamp: new Date().toISOString()
      };

      await fs.writeJson('./reports/test-summary.json', summary, { spaces: 2 });
      
      console.log('\n📊 Test Execution Summary:');
      console.log(`Total Scenarios: ${summary.total}`);
      console.log(`Passed: ${summary.passed}`);
      console.log(`Failed: ${summary.failed}`);
      console.log(`Skipped: ${summary.skipped}`);
      console.log(`Pass Rate: ${summary.passRate}%`);
      
    } catch (error) {
      console.error('❌ Error generating test summary:', error);
    }
  }

  static async cleanupOldReports(daysToKeep = 7) {
    try {
      const reportsDir = './reports';
      const screenshotsDir = './test-results/screenshots';
      const videosDir = './test-results/videos';
      const tracesDir = './test-results/traces';
      
      const directories = [reportsDir, screenshotsDir, videosDir, tracesDir];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      for (const dir of directories) {
        if (await fs.pathExists(dir)) {
          const files = await fs.readdir(dir);
          
          for (const file of files) {
            const filePath = path.join(dir, file);
            const stats = await fs.stat(filePath);
            
            if (stats.mtime < cutoffDate) {
              await fs.remove(filePath);
              console.log(`🗑️ Removed old file: ${filePath}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error cleaning up old reports:', error);
    }
  }
}

module.exports = ReportGenerator;

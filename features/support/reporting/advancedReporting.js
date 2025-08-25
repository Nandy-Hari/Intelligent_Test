/**
 * Advanced reporting utilities for Intelligent_Automation framework
 * Provides enhanced reporting capabilities including dashboards, trends, and performance metrics
 * (Temporarily modified to run login tests without dependencies)
 */
const fs = require('fs-extra');
const path = require('path');
// Temporarily comment out dependencies
// const nodemailer = require('nodemailer');
// const Chart = require('chart.js');
// const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
// const dayjs = require('dayjs');
// const sqlite3 = require('sqlite3');
// const { open } = require('sqlite');

class AdvancedReporting {
  constructor() {
    this.reportDir = path.join(__dirname, '../../../reports');
    this.historyDir = path.join(this.reportDir, 'history');
    this.dashboardDir = path.join(this.reportDir, 'dashboard');
    this.dbPath = path.join(this.reportDir, 'test_history.db');
    this.reportsDbInitialized = false;
    
    // Ensure directories exist
    fs.ensureDirSync(this.reportDir);
    fs.ensureDirSync(this.historyDir);
    fs.ensureDirSync(this.dashboardDir);
    fs.ensureDirSync(path.join(this.dashboardDir, 'assets'));
    fs.ensureDirSync(path.join(this.dashboardDir, 'charts'));
  }

  /**
   * Initialize the reports database
   * @returns {Promise<void>}
   */
  async initializeDb() {
    if (this.reportsDbInitialized) return;
    
    // Open the database
    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database
    });
    
    // Create tables if they don't exist
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS test_runs (
        run_id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        duration INTEGER,
        total_scenarios INTEGER,
        passed_scenarios INTEGER,
        failed_scenarios INTEGER,
        skipped_scenarios INTEGER,
        ambiguous_scenarios INTEGER,
        total_steps INTEGER,
        passed_steps INTEGER,
        failed_steps INTEGER,
        skipped_steps INTEGER,
        ambiguous_steps INTEGER,
        browser TEXT,
        environment TEXT,
        ci_build_number TEXT,
        git_branch TEXT,
        git_commit TEXT
      );
      
      CREATE TABLE IF NOT EXISTS scenarios (
        scenario_id INTEGER PRIMARY KEY AUTOINCREMENT,
        run_id INTEGER,
        feature_file TEXT,
        feature_name TEXT,
        scenario_name TEXT,
        status TEXT,
        duration INTEGER,
        error_message TEXT,
        tags TEXT,
        FOREIGN KEY (run_id) REFERENCES test_runs(run_id)
      );
      
      CREATE TABLE IF NOT EXISTS steps (
        step_id INTEGER PRIMARY KEY AUTOINCREMENT,
        scenario_id INTEGER,
        step_text TEXT,
        status TEXT,
        duration INTEGER,
        error_message TEXT,
        FOREIGN KEY (scenario_id) REFERENCES scenarios(scenario_id)
      );
      
      CREATE TABLE IF NOT EXISTS performance_metrics (
        metric_id INTEGER PRIMARY KEY AUTOINCREMENT,
        scenario_id INTEGER,
        page_url TEXT,
        load_time INTEGER,
        dom_content_loaded INTEGER,
        first_paint INTEGER,
        largest_contentful_paint INTEGER,
        first_input_delay INTEGER,
        total_blocking_time INTEGER,
        cumulative_layout_shift REAL,
        resource_count INTEGER,
        resource_size INTEGER,
        FOREIGN KEY (scenario_id) REFERENCES scenarios(scenario_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_test_runs_timestamp ON test_runs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_scenarios_run_id ON scenarios(run_id);
      CREATE INDEX IF NOT EXISTS idx_scenarios_status ON scenarios(status);
      CREATE INDEX IF NOT EXISTS idx_steps_scenario_id ON steps(scenario_id);
      CREATE INDEX IF NOT EXISTS idx_performance_metrics_scenario_id ON performance_metrics(scenario_id);
    `);
    
    this.reportsDbInitialized = true;
  }

  /**
   * Store test run results in the database
   * @param {Object} results - Test run results
   * @returns {Promise<number>} - The run ID
   */
  async storeTestRunResults(results) {
    await this.initializeDb();
    
    // Get environment information
    const environment = process.env.TEST_ENVIRONMENT || 'development';
    const browser = process.env.BROWSER || 'chromium';
    const ciBuildNumber = process.env.CI_BUILD_NUMBER || process.env.BUILD_NUMBER || '';
    const gitBranch = process.env.GIT_BRANCH || '';
    const gitCommit = process.env.GIT_COMMIT || '';
    
    // Extract test run metrics
    const { 
      duration, 
      totalScenarios, 
      passedScenarios, 
      failedScenarios, 
      skippedScenarios, 
      ambiguousScenarios,
      totalSteps,
      passedSteps,
      failedSteps,
      skippedSteps,
      ambiguousSteps
    } = this.extractRunMetrics(results);
    
    // Insert test run
    const runResult = await this.db.run(`
      INSERT INTO test_runs (
        duration, total_scenarios, passed_scenarios, failed_scenarios, skipped_scenarios, ambiguous_scenarios,
        total_steps, passed_steps, failed_steps, skipped_steps, ambiguous_steps,
        browser, environment, ci_build_number, git_branch, git_commit
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      duration, totalScenarios, passedScenarios, failedScenarios, skippedScenarios, ambiguousScenarios,
      totalSteps, passedSteps, failedSteps, skippedSteps, ambiguousSteps,
      browser, environment, ciBuildNumber, gitBranch, gitCommit
    ]);
    
    const runId = runResult.lastID;
    
    // Store scenario and step details
    await this.storeScenarioDetails(runId, results);
    
    return runId;
  }

  /**
   * Extract metrics from test run results
   * @param {Object} results - Test run results
   * @returns {Object} - Extracted metrics
   */
  extractRunMetrics(results) {
    let totalScenarios = 0;
    let passedScenarios = 0;
    let failedScenarios = 0;
    let skippedScenarios = 0;
    let ambiguousScenarios = 0;
    let totalSteps = 0;
    let passedSteps = 0;
    let failedSteps = 0;
    let skippedSteps = 0;
    let ambiguousSteps = 0;
    let duration = 0;
    
    if (results.features) {
      results.features.forEach(feature => {
        if (feature.elements) {
          feature.elements.forEach(scenario => {
            totalScenarios++;
            
            // Check scenario status
            if (scenario.steps && scenario.steps.length > 0) {
              const failedStep = scenario.steps.find(step => step.result && step.result.status === 'failed');
              const ambiguousStep = scenario.steps.find(step => step.result && step.result.status === 'ambiguous');
              const skippedStep = scenario.steps.find(step => step.result && step.result.status === 'skipped');
              
              if (failedStep) {
                failedScenarios++;
              } else if (ambiguousStep) {
                ambiguousScenarios++;
              } else if (skippedStep) {
                skippedScenarios++;
              } else {
                passedScenarios++;
              }
              
              // Count steps
              scenario.steps.forEach(step => {
                totalSteps++;
                
                if (step.result) {
                  switch (step.result.status) {
                    case 'passed':
                      passedSteps++;
                      duration += step.result.duration || 0;
                      break;
                    case 'failed':
                      failedSteps++;
                      duration += step.result.duration || 0;
                      break;
                    case 'skipped':
                      skippedSteps++;
                      break;
                    case 'ambiguous':
                      ambiguousSteps++;
                      break;
                  }
                }
              });
            }
          });
        }
      });
    }
    
    return {
      duration: Math.round(duration / 1000000), // Convert nanoseconds to milliseconds
      totalScenarios,
      passedScenarios,
      failedScenarios,
      skippedScenarios,
      ambiguousScenarios,
      totalSteps,
      passedSteps,
      failedSteps,
      skippedSteps,
      ambiguousSteps
    };
  }

  /**
   * Store scenario and step details in the database
   * @param {number} runId - Test run ID
   * @param {Object} results - Test run results
   * @returns {Promise<void>}
   */
  async storeScenarioDetails(runId, results) {
    if (results.features) {
      for (const feature of results.features) {
        if (feature.elements) {
          for (const scenario of feature.elements) {
            // Get scenario status
            let scenarioStatus = 'passed';
            let errorMessage = '';
            
            if (scenario.steps && scenario.steps.length > 0) {
              const failedStep = scenario.steps.find(step => step.result && step.result.status === 'failed');
              const ambiguousStep = scenario.steps.find(step => step.result && step.result.status === 'ambiguous');
              const skippedStep = scenario.steps.find(step => step.result && step.result.status === 'skipped');
              
              if (failedStep) {
                scenarioStatus = 'failed';
                errorMessage = failedStep.result.error_message || '';
              } else if (ambiguousStep) {
                scenarioStatus = 'ambiguous';
              } else if (skippedStep && !scenario.steps.find(step => step.result && step.result.status === 'passed')) {
                scenarioStatus = 'skipped';
              }
            }
            
            // Calculate scenario duration
            const scenarioDuration = scenario.steps 
              ? scenario.steps.reduce((sum, step) => sum + (step.result ? step.result.duration || 0 : 0), 0)
              : 0;
            
            // Extract tags
            const tags = scenario.tags ? scenario.tags.map(tag => tag.name).join(',') : '';
            
            // Insert scenario
            const scenarioResult = await this.db.run(`
              INSERT INTO scenarios (
                run_id, feature_file, feature_name, scenario_name, status, duration, error_message, tags
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              runId,
              feature.uri || '',
              feature.name || '',
              scenario.name || '',
              scenarioStatus,
              Math.round(scenarioDuration / 1000000), // Convert nanoseconds to milliseconds
              errorMessage,
              tags
            ]);
            
            const scenarioId = scenarioResult.lastID;
            
            // Insert steps
            if (scenario.steps) {
              for (const step of scenario.steps) {
                await this.db.run(`
                  INSERT INTO steps (
                    scenario_id, step_text, status, duration, error_message
                  ) VALUES (?, ?, ?, ?, ?)
                `, [
                  scenarioId,
                  step.name || '',
                  step.result ? step.result.status : 'unknown',
                  Math.round((step.result ? step.result.duration || 0 : 0) / 1000000), // Convert nanoseconds to milliseconds
                  step.result && step.result.error_message ? step.result.error_message : ''
                ]);
              }
            }
            
            // If performance metrics were collected, store them
            if (scenario.performanceMetrics) {
              const metrics = scenario.performanceMetrics;
              await this.db.run(`
                INSERT INTO performance_metrics (
                  scenario_id, page_url, load_time, dom_content_loaded, first_paint,
                  largest_contentful_paint, first_input_delay, total_blocking_time,
                  cumulative_layout_shift, resource_count, resource_size
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `, [
                scenarioId,
                metrics.pageUrl || '',
                metrics.loadTime || 0,
                metrics.domContentLoaded || 0,
                metrics.firstPaint || 0,
                metrics.largestContentfulPaint || 0,
                metrics.firstInputDelay || 0,
                metrics.totalBlockingTime || 0,
                metrics.cumulativeLayoutShift || 0,
                metrics.resourceCount || 0,
                metrics.resourceSize || 0
              ]);
            }
          }
        }
      }
    }
  }

  /**
   * Generate a test execution dashboard
   * @param {number} runId - Test run ID (optional, uses latest if not provided)
   * @returns {Promise<string>} - Path to the dashboard HTML file
   */
  async generateDashboard(runId = null) {
    await this.initializeDb();
    
    // Get the run ID if not provided
    if (!runId) {
      const latestRun = await this.db.get('SELECT run_id FROM test_runs ORDER BY timestamp DESC LIMIT 1');
      if (!latestRun) {
        throw new Error('No test runs found in the database');
      }
      runId = latestRun.run_id;
    }
    
    // Get test run data
    const testRun = await this.db.get('SELECT * FROM test_runs WHERE run_id = ?', [runId]);
    if (!testRun) {
      throw new Error(`Test run with ID ${runId} not found`);
    }
    
    // Get scenario data
    const scenarios = await this.db.all('SELECT * FROM scenarios WHERE run_id = ?', [runId]);
    
    // Get step data for failed scenarios
    const failedScenarios = scenarios.filter(s => s.status === 'failed');
    for (const scenario of failedScenarios) {
      scenario.steps = await this.db.all('SELECT * FROM steps WHERE scenario_id = ?', [scenario.scenario_id]);
    }
    
    // Generate charts
    const passRateChartPath = await this.generatePassRateChart(testRun);
    const trendsChartPath = await this.generateTrendsChart();
    const durationChartPath = await this.generateDurationChart(runId);
    const topErrorsChartPath = await this.generateTopErrorsChart();
    
    // Generate HTML dashboard
    const dashboardPath = path.join(this.dashboardDir, 'index.html');
    const dashboardContent = this.generateDashboardHtml(
      testRun,
      scenarios,
      failedScenarios,
      passRateChartPath,
      trendsChartPath,
      durationChartPath,
      topErrorsChartPath
    );
    
    // Write the dashboard
    fs.writeFileSync(dashboardPath, dashboardContent);
    
    return dashboardPath;
  }

  /**
   * Generate a pass rate chart
   * @param {Object} testRun - Test run data
   * @returns {Promise<string>} - Path to the chart image
   */
  async generatePassRateChart(testRun) {
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 500, height: 300 });
    
    const chartConfig = {
      type: 'doughnut',
      data: {
        labels: ['Passed', 'Failed', 'Skipped', 'Ambiguous'],
        datasets: [{
          data: [
            testRun.passed_scenarios,
            testRun.failed_scenarios,
            testRun.skipped_scenarios,
            testRun.ambiguous_scenarios
          ],
          backgroundColor: ['#4CAF50', '#F44336', '#FFC107', '#FF9800']
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Scenario Status Distribution'
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    };
    
    const chartImageBuffer = await chartJSNodeCanvas.renderToBuffer(chartConfig);
    const chartImagePath = path.join(this.dashboardDir, 'charts', 'pass-rate-chart.png');
    fs.writeFileSync(chartImagePath, chartImageBuffer);
    
    return path.relative(this.dashboardDir, chartImagePath);
  }

  /**
   * Generate a trends chart showing test results over time
   * @returns {Promise<string>} - Path to the chart image
   */
  async generateTrendsChart() {
    // Get the last 10 test runs
    const recentRuns = await this.db.all(`
      SELECT 
        run_id, 
        timestamp, 
        passed_scenarios, 
        failed_scenarios, 
        total_scenarios 
      FROM test_runs 
      ORDER BY timestamp DESC 
      LIMIT 10
    `);
    
    // Reverse to show chronological order
    recentRuns.reverse();
    
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 800, height: 400 });
    
    const chartConfig = {
      type: 'line',
      data: {
        labels: recentRuns.map(run => dayjs(run.timestamp).format('MM/DD HH:mm')),
        datasets: [
          {
            label: 'Passed',
            data: recentRuns.map(run => run.passed_scenarios),
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            fill: true
          },
          {
            label: 'Failed',
            data: recentRuns.map(run => run.failed_scenarios),
            borderColor: '#F44336',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            fill: true
          },
          {
            label: 'Pass Rate (%)',
            data: recentRuns.map(run => Math.round((run.passed_scenarios / run.total_scenarios) * 100) || 0),
            borderColor: '#2196F3',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            fill: false,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Scenarios'
            }
          },
          y1: {
            beginAtZero: true,
            max: 100,
            position: 'right',
            grid: {
              drawOnChartArea: false
            },
            title: {
              display: true,
              text: 'Pass Rate (%)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Test Run Date/Time'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Test Result Trends'
          }
        }
      }
    };
    
    const chartImageBuffer = await chartJSNodeCanvas.renderToBuffer(chartConfig);
    const chartImagePath = path.join(this.dashboardDir, 'charts', 'trends-chart.png');
    fs.writeFileSync(chartImagePath, chartImageBuffer);
    
    return path.relative(this.dashboardDir, chartImagePath);
  }

  /**
   * Generate a duration chart for a specific test run
   * @param {number} runId - Test run ID
   * @returns {Promise<string>} - Path to the chart image
   */
  async generateDurationChart(runId) {
    // Get the top 10 longest-running scenarios
    const slowestScenarios = await this.db.all(`
      SELECT 
        scenario_name,
        feature_name,
        duration
      FROM scenarios 
      WHERE run_id = ?
      ORDER BY duration DESC 
      LIMIT 10
    `, [runId]);
    
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 800, height: 500 });
    
    const chartConfig = {
      type: 'bar',
      data: {
        labels: slowestScenarios.map(scenario => {
          // Truncate long scenario names
          const name = scenario.scenario_name.length > 30 
            ? scenario.scenario_name.substring(0, 27) + '...'
            : scenario.scenario_name;
          return name;
        }),
        datasets: [{
          label: 'Duration (ms)',
          data: slowestScenarios.map(scenario => scenario.duration),
          backgroundColor: 'rgba(33, 150, 243, 0.6)',
          borderColor: 'rgba(33, 150, 243, 1)',
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Top 10 Longest Running Scenarios (ms)'
          },
          tooltip: {
            callbacks: {
              title: (items) => {
                const index = items[0].dataIndex;
                return slowestScenarios[index].scenario_name;
              },
              afterTitle: (items) => {
                const index = items[0].dataIndex;
                return slowestScenarios[index].feature_name;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Duration (milliseconds)'
            }
          }
        }
      }
    };
    
    const chartImageBuffer = await chartJSNodeCanvas.renderToBuffer(chartConfig);
    const chartImagePath = path.join(this.dashboardDir, 'charts', 'duration-chart.png');
    fs.writeFileSync(chartImagePath, chartImageBuffer);
    
    return path.relative(this.dashboardDir, chartImagePath);
  }

  /**
   * Generate a chart showing the top error types
   * @returns {Promise<string>} - Path to the chart image
   */
  async generateTopErrorsChart() {
    // Get error counts by message pattern
    const errorGroups = await this.db.all(`
      WITH error_messages AS (
        SELECT 
          CASE 
            WHEN error_message LIKE '%Element not found%' THEN 'Element not found'
            WHEN error_message LIKE '%Timeout%' THEN 'Timeout'
            WHEN error_message LIKE '%AssertionError%' THEN 'Assertion Error'
            WHEN error_message LIKE '%Connection refused%' THEN 'Connection Error'
            WHEN error_message LIKE '%undefined is not%' THEN 'JavaScript Error'
            ELSE 'Other Error'
          END AS error_type,
          COUNT(*) AS count
        FROM scenarios
        WHERE status = 'failed'
        AND error_message IS NOT NULL
        GROUP BY error_type
        ORDER BY count DESC
        LIMIT 5
      )
      SELECT * FROM error_messages
    `);
    
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 500, height: 300 });
    
    const chartConfig = {
      type: 'pie',
      data: {
        labels: errorGroups.map(group => group.error_type),
        datasets: [{
          data: errorGroups.map(group => group.count),
          backgroundColor: [
            'rgba(244, 67, 54, 0.8)',
            'rgba(255, 152, 0, 0.8)',
            'rgba(255, 87, 34, 0.8)',
            'rgba(121, 85, 72, 0.8)',
            'rgba(158, 158, 158, 0.8)'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Top Error Categories'
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    };
    
    const chartImageBuffer = await chartJSNodeCanvas.renderToBuffer(chartConfig);
    const chartImagePath = path.join(this.dashboardDir, 'charts', 'errors-chart.png');
    fs.writeFileSync(chartImagePath, chartImageBuffer);
    
    return path.relative(this.dashboardDir, chartImagePath);
  }

  /**
   * Generate the HTML for the dashboard
   * @param {Object} testRun - Test run data
   * @param {Array} scenarios - All scenarios in the test run
   * @param {Array} failedScenarios - Failed scenarios with steps
   * @param {string} passRateChartPath - Path to the pass rate chart
   * @param {string} trendsChartPath - Path to the trends chart
   * @param {string} durationChartPath - Path to the duration chart
   * @param {string} topErrorsChartPath - Path to the top errors chart
   * @returns {string} - HTML content
   */
  generateDashboardHtml(
    testRun,
    scenarios,
    failedScenarios,
    passRateChartPath,
    trendsChartPath,
    durationChartPath,
    topErrorsChartPath
  ) {
    const passRate = Math.round((testRun.passed_scenarios / testRun.total_scenarios) * 100) || 0;
    const timestamp = dayjs(testRun.timestamp).format('YYYY-MM-DD HH:mm:ss');
    const duration = this.formatDuration(testRun.duration);
    
    // Generate failed scenarios table
    let failedScenariosHtml = '';
    if (failedScenarios.length > 0) {
      failedScenariosHtml = `
        <h2>Failed Scenarios</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>Scenario</th>
              <th>Steps</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            ${failedScenarios.map(scenario => `
              <tr>
                <td>${scenario.feature_name}</td>
                <td>${scenario.scenario_name}</td>
                <td>
                  <ul class="steps">
                    ${scenario.steps.map(step => `
                      <li class="step ${step.status}">
                        ${step.step_text}
                        ${step.status === 'failed' ? `<pre class="error">${this.escapeHtml(step.error_message)}</pre>` : ''}
                      </li>
                    `).join('')}
                  </ul>
                </td>
                <td>
                  <pre class="error">${this.escapeHtml(scenario.error_message).substring(0, 300)}${scenario.error_message.length > 300 ? '...' : ''}</pre>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Intelligent_Automation - Test Dashboard</title>
  <style>
    :root {
      --primary-color: #3f51b5;
      --secondary-color: #ff4081;
      --success-color: #4caf50;
      --warning-color: #ff9800;
      --danger-color: #f44336;
      --light-color: #f5f5f5;
      --dark-color: #212121;
      --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    body {
      font-family: var(--font-family);
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
      color: var(--dark-color);
    }
    
    .container {
      width: 95%;
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }
    
    header {
      background-color: var(--primary-color);
      color: white;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    
    h1, h2, h3 {
      margin-top: 0;
    }
    
    .summary {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .summary-card {
      background-color: white;
      border-radius: 4px;
      padding: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      flex: 1;
      min-width: 200px;
    }
    
    .summary-card h3 {
      margin-top: 0;
      color: var(--primary-color);
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    
    .summary-value {
      font-size: 24px;
      font-weight: bold;
    }
    
    .summary-label {
      font-size: 14px;
      color: #666;
    }
    
    .charts {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .chart-container {
      background-color: white;
      border-radius: 4px;
      padding: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      flex: 1;
      min-width: 300px;
    }
    
    .chart-container.large {
      flex-basis: 100%;
    }
    
    .chart-container h3 {
      margin-top: 0;
      color: var(--primary-color);
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    
    .chart {
      width: 100%;
      height: auto;
      margin-top: 15px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      background-color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-radius: 4px;
    }
    
    th, td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    
    thead tr {
      background-color: var(--primary-color);
      color: white;
    }
    
    tbody tr:hover {
      background-color: #f5f5f5;
    }
    
    .pass-rate {
      font-size: 48px;
      font-weight: bold;
      text-align: center;
      margin: 10px 0;
    }
    
    .pass-rate.good {
      color: var(--success-color);
    }
    
    .pass-rate.average {
      color: var(--warning-color);
    }
    
    .pass-rate.poor {
      color: var(--danger-color);
    }
    
    .steps {
      list-style-type: none;
      padding-left: 0;
      margin: 0;
    }
    
    .step {
      margin-bottom: 5px;
      padding: 5px;
      border-radius: 3px;
    }
    
    .step.passed {
      background-color: rgba(76, 175, 80, 0.1);
      border-left: 3px solid var(--success-color);
    }
    
    .step.failed {
      background-color: rgba(244, 67, 54, 0.1);
      border-left: 3px solid var(--danger-color);
    }
    
    .step.skipped {
      background-color: rgba(255, 152, 0, 0.1);
      border-left: 3px solid var(--warning-color);
    }
    
    .error {
      background-color: rgba(244, 67, 54, 0.05);
      padding: 10px;
      border-radius: 3px;
      margin-top: 5px;
      font-size: 12px;
      overflow: auto;
      max-height: 150px;
      white-space: pre-wrap;
      word-break: break-word;
    }
    
    footer {
      margin-top: 30px;
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 14px;
    }
    
    @media (max-width: 768px) {
      .summary, .charts {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Intelligent_Automation Test Dashboard</h1>
      <p>Test execution report for ${testRun.environment} environment using ${testRun.browser} browser</p>
    </header>
    
    <div class="summary">
      <div class="summary-card">
        <h3>Test Execution Summary</h3>
        <div class="summary-stats">
          <div><span class="summary-label">Execution Date:</span> ${timestamp}</div>
          <div><span class="summary-label">Duration:</span> ${duration}</div>
          <div><span class="summary-label">Environment:</span> ${testRun.environment}</div>
          <div><span class="summary-label">Browser:</span> ${testRun.browser}</div>
          ${testRun.ci_build_number ? `<div><span class="summary-label">Build:</span> ${testRun.ci_build_number}</div>` : ''}
          ${testRun.git_branch ? `<div><span class="summary-label">Branch:</span> ${testRun.git_branch}</div>` : ''}
          ${testRun.git_commit ? `<div><span class="summary-label">Commit:</span> ${testRun.git_commit.substring(0, 7)}</div>` : ''}
        </div>
      </div>
      
      <div class="summary-card">
        <h3>Scenarios</h3>
        <div class="summary-stats">
          <div><span class="summary-value">${testRun.total_scenarios}</span> <span class="summary-label">Total</span></div>
          <div><span class="summary-value" style="color: var(--success-color)">${testRun.passed_scenarios}</span> <span class="summary-label">Passed</span></div>
          <div><span class="summary-value" style="color: var(--danger-color)">${testRun.failed_scenarios}</span> <span class="summary-label">Failed</span></div>
          <div><span class="summary-value" style="color: var(--warning-color)">${testRun.skipped_scenarios}</span> <span class="summary-label">Skipped</span></div>
        </div>
      </div>
      
      <div class="summary-card">
        <h3>Steps</h3>
        <div class="summary-stats">
          <div><span class="summary-value">${testRun.total_steps}</span> <span class="summary-label">Total</span></div>
          <div><span class="summary-value" style="color: var(--success-color)">${testRun.passed_steps}</span> <span class="summary-label">Passed</span></div>
          <div><span class="summary-value" style="color: var(--danger-color)">${testRun.failed_steps}</span> <span class="summary-label">Failed</span></div>
          <div><span class="summary-value" style="color: var(--warning-color)">${testRun.skipped_steps}</span> <span class="summary-label">Skipped</span></div>
        </div>
      </div>
      
      <div class="summary-card">
        <h3>Pass Rate</h3>
        <div class="pass-rate ${passRate >= 90 ? 'good' : passRate >= 70 ? 'average' : 'poor'}">
          ${passRate}%
        </div>
      </div>
    </div>
    
    <div class="charts">
      <div class="chart-container">
        <h3>Scenario Status Distribution</h3>
        <img src="${passRateChartPath}" alt="Pass Rate Chart" class="chart">
      </div>
      
      <div class="chart-container">
        <h3>Error Categories</h3>
        <img src="${topErrorsChartPath}" alt="Top Errors Chart" class="chart">
      </div>
      
      <div class="chart-container large">
        <h3>Test Result Trends</h3>
        <img src="${trendsChartPath}" alt="Trends Chart" class="chart">
      </div>
      
      <div class="chart-container large">
        <h3>Scenario Duration</h3>
        <img src="${durationChartPath}" alt="Duration Chart" class="chart">
      </div>
    </div>
    
    ${failedScenariosHtml}
    
    <footer>
      Generated by Intelligent_Automation Framework on ${new Date().toLocaleString()}
    </footer>
  </div>
</body>
</html>`;
  }

  /**
   * Format a duration in milliseconds to a human-readable string
   * @param {number} milliseconds - Duration in milliseconds
   * @returns {string} - Formatted duration
   */
  formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    const remainingMinutes = minutes % 60;
    const remainingSeconds = seconds % 60;
    const remainingMs = milliseconds % 1000;
    
    let result = '';
    if (hours > 0) {
      result += `${hours}h `;
    }
    if (hours > 0 || remainingMinutes > 0) {
      result += `${remainingMinutes}m `;
    }
    result += `${remainingSeconds}.${remainingMs}s`;
    
    return result;
  }

  /**
   * Escape HTML special characters
   * @param {string} text - Text to escape
   * @returns {string} - Escaped text
   */
  escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Send an email with test results
   * @param {string} recipients - Comma-separated email addresses
   * @param {number} runId - Test run ID
   * @returns {Promise<void>}
   */
  async sendEmailReport(recipients, runId) {
    // Generate dashboard if not already generated
    const dashboardPath = await this.generateDashboard(runId);
    
    // Get test run data
    const testRun = await this.db.get('SELECT * FROM test_runs WHERE run_id = ?', [runId]);
    
    // Setup email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
    
    // Calculate pass rate
    const passRate = Math.round((testRun.passed_scenarios / testRun.total_scenarios) * 100) || 0;
    const timestamp = dayjs(testRun.timestamp).format('YYYY-MM-DD HH:mm:ss');
    
    // Prepare email content
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3f51b5;">Intelligent_Automation Test Results</h1>
        <p>Test execution report for <strong>${testRun.environment}</strong> environment using <strong>${testRun.browser}</strong> browser</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <div><strong>Execution Date:</strong> ${timestamp}</div>
          <div><strong>Pass Rate:</strong> <span style="color: ${passRate >= 90 ? '#4caf50' : passRate >= 70 ? '#ff9800' : '#f44336'}; font-weight: bold;">${passRate}%</span></div>
          <div><strong>Total Scenarios:</strong> ${testRun.total_scenarios}</div>
          <div><strong>Passed:</strong> <span style="color: #4caf50;">${testRun.passed_scenarios}</span></div>
          <div><strong>Failed:</strong> <span style="color: #f44336;">${testRun.failed_scenarios}</span></div>
          <div><strong>Skipped:</strong> <span style="color: #ff9800;">${testRun.skipped_scenarios}</span></div>
        </div>
        
        <p>View the <a href="file://${path.resolve(dashboardPath)}">complete dashboard</a> for more details.</p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          This is an automated email from Intelligent_Automation Framework. Please do not reply.
        </p>
      </div>
    `;
    
    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Intelligent_Automation" <reports@example.com>',
      to: recipients,
      subject: `[${testRun.failed_scenarios > 0 ? 'FAILED' : 'PASSED'}] Test Results - ${passRate}% Pass Rate`,
      html: emailHtml
    });
  }
}

module.exports = new AdvancedReporting();

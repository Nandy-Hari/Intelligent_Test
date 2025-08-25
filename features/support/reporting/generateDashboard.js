/**
 * Dashboard Generator for Intelligent_Automation framework
 * Creates interactive dashboards for test results visualization
 */
const fs = require('fs-extra');
const path = require('path');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const dayjs = require('dayjs');
require('dotenv').config();

// Import advanced reporting
const AdvancedReporting = require('./advancedReporting');
const advancedReporting = new AdvancedReporting();

// Configure chart rendering
const width = 800;
const height = 400;
const chartCallback = (ChartJS) => {
  ChartJS.defaults.responsive = true;
  ChartJS.defaults.maintainAspectRatio = false;
  ChartJS.defaults.plugins.title.display = true;
  ChartJS.defaults.plugins.title.font = { size: 16 };
  ChartJS.defaults.plugins.legend.position = 'right';
};

const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: 'white', chartCallback });

/**
 * Generate an enhanced dashboard with interactive charts
 */
async function generateDashboard() {
  try {
    console.log('Generating enhanced dashboard...');
    
    // Initialize database
    await advancedReporting.initializeDb();
    
    // Get latest test run ID
    const latestRun = await advancedReporting.db.get('SELECT run_id FROM test_runs ORDER BY timestamp DESC LIMIT 1');
    
    if (!latestRun) {
      console.error('No test runs found in database');
      process.exit(1);
    }
    
    const runId = latestRun.run_id;
    
    // Generate charts
    const passRateChartPath = await generatePassRateChart(runId);
    const trendsChartPath = await generateTrendsChart();
    const durationChartPath = await generateDurationChart(runId);
    const errorTypesChartPath = await generateErrorTypesChart(runId);
    const performanceMetricsChartPath = await generatePerformanceMetricsChart(runId);
    const featureComparisonChartPath = await generateFeatureComparisonChart(runId);
    
    // Generate HTML dashboard
    const dashboardContent = await generateDashboardHtml(
      runId,
      passRateChartPath,
      trendsChartPath,
      durationChartPath,
      errorTypesChartPath,
      performanceMetricsChartPath,
      featureComparisonChartPath
    );
    
    // Save dashboard
    const dashboardPath = path.join(advancedReporting.dashboardDir, 'index.html');
    await fs.writeFile(dashboardPath, dashboardContent);
    
    console.log(`Enhanced dashboard generated: ${dashboardPath}`);
    await advancedReporting.db.close();
    
  } catch (error) {
    console.error('Error generating dashboard:', error);
    process.exit(1);
  }
}

/**
 * Generate pass rate pie chart
 * @param {number} runId - Test run ID
 * @returns {Promise<string>} - Path to the generated chart image
 */
async function generatePassRateChart(runId) {
  // Get test run data
  const testRun = await advancedReporting.db.get('SELECT * FROM test_runs WHERE run_id = ?', [runId]);
  
  // Prepare chart data
  const data = {
    labels: ['Passed', 'Failed', 'Skipped', 'Ambiguous'],
    datasets: [{
      data: [
        testRun.passed_scenarios,
        testRun.failed_scenarios,
        testRun.skipped_scenarios,
        testRun.ambiguous_scenarios
      ],
      backgroundColor: ['#4caf50', '#f44336', '#ff9800', '#9c27b0']
    }]
  };
  
  // Set up chart config
  const config = {
    type: 'pie',
    data: data,
    options: {
      plugins: {
        title: {
          text: 'Test Scenarios Status'
        }
      }
    }
  };
  
  // Generate and save chart
  const chartImageBuffer = await chartJSNodeCanvas.renderToBuffer(config);
  const chartPath = path.join(advancedReporting.dashboardDir, 'charts', 'pass-rate.png');
  await fs.writeFile(chartPath, chartImageBuffer);
  
  return path.relative(advancedReporting.dashboardDir, chartPath);
}

/**
 * Generate trends line chart
 * @returns {Promise<string>} - Path to the generated chart image
 */
async function generateTrendsChart() {
  // Get historical test run data (last 10 runs)
  const runs = await advancedReporting.db.all(`
    SELECT run_id, timestamp, 
           passed_scenarios, failed_scenarios, 
           skipped_scenarios, ambiguous_scenarios,
           total_scenarios
    FROM test_runs
    ORDER BY timestamp DESC
    LIMIT 10
  `);
  
  // Reverse to get chronological order
  runs.reverse();
  
  // Prepare chart data
  const data = {
    labels: runs.map(run => dayjs(run.timestamp).format('MM/DD')),
    datasets: [
      {
        label: 'Pass Rate %',
        data: runs.map(run => Math.round((run.passed_scenarios / run.total_scenarios) * 100)),
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
        tension: 0.2
      },
      {
        label: 'Failed',
        data: runs.map(run => run.failed_scenarios),
        borderColor: '#f44336',
        backgroundColor: 'transparent'
      },
      {
        label: 'Skipped',
        data: runs.map(run => run.skipped_scenarios),
        borderColor: '#ff9800',
        backgroundColor: 'transparent'
      }
    ]
  };
  
  // Set up chart config
  const config = {
    type: 'line',
    data: data,
    options: {
      plugins: {
        title: {
          text: 'Test Results Trend (Last 10 Runs)'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };
  
  // Generate and save chart
  const chartImageBuffer = await chartJSNodeCanvas.renderToBuffer(config);
  const chartPath = path.join(advancedReporting.dashboardDir, 'charts', 'trends.png');
  await fs.writeFile(chartPath, chartImageBuffer);
  
  return path.relative(advancedReporting.dashboardDir, chartPath);
}

/**
 * Generate duration bar chart
 * @param {number} runId - Test run ID
 * @returns {Promise<string>} - Path to the generated chart image
 */
async function generateDurationChart(runId) {
  // Get top 10 longest running scenarios
  const scenarios = await advancedReporting.db.all(`
    SELECT scenario_name, duration 
    FROM scenarios 
    WHERE run_id = ? 
    ORDER BY duration DESC 
    LIMIT 10
  `, [runId]);
  
  // Prepare chart data
  const data = {
    labels: scenarios.map(s => truncateString(s.scenario_name, 30)),
    datasets: [{
      label: 'Duration (seconds)',
      data: scenarios.map(s => Math.round(s.duration / 1000)),
      backgroundColor: 'rgba(33, 150, 243, 0.6)',
      borderColor: '#2196f3',
      borderWidth: 1
    }]
  };
  
  // Set up chart config
  const config = {
    type: 'bar',
    data: data,
    options: {
      indexAxis: 'y',
      plugins: {
        title: {
          text: 'Top 10 Longest Running Scenarios'
        }
      }
    }
  };
  
  // Generate and save chart
  const chartImageBuffer = await chartJSNodeCanvas.renderToBuffer(config);
  const chartPath = path.join(advancedReporting.dashboardDir, 'charts', 'duration.png');
  await fs.writeFile(chartPath, chartImageBuffer);
  
  return path.relative(advancedReporting.dashboardDir, chartPath);
}

/**
 * Generate error types chart
 * @param {number} runId - Test run ID
 * @returns {Promise<string>} - Path to the generated chart image
 */
async function generateErrorTypesChart(runId) {
  // Get error messages from failed scenarios
  const failedScenarios = await advancedReporting.db.all(`
    SELECT error_message FROM scenarios WHERE run_id = ? AND status = 'failed'
  `, [runId]);
  
  // Extract error types
  const errorTypes = {};
  failedScenarios.forEach(scenario => {
    if (!scenario.error_message) return;
    
    // Extract error type (e.g., "TypeError: Cannot read property 'x' of undefined")
    const match = scenario.error_message.match(/^([A-Za-z]+Error|AssertionError)/);
    const errorType = match ? match[0] : 'Other Error';
    
    errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
  });
  
  // Prepare chart data
  const errorLabels = Object.keys(errorTypes);
  const errorCounts = Object.values(errorTypes);
  
  // If no errors, provide default data
  if (errorLabels.length === 0) {
    errorLabels.push('No Errors');
    errorCounts.push(1);
  }
  
  const data = {
    labels: errorLabels,
    datasets: [{
      data: errorCounts,
      backgroundColor: [
        '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', 
        '#2196f3', '#03a9f4', '#00bcd4', '#009688'
      ]
    }]
  };
  
  // Set up chart config
  const config = {
    type: 'pie',
    data: data,
    options: {
      plugins: {
        title: {
          text: 'Error Types Distribution'
        }
      }
    }
  };
  
  // Generate and save chart
  const chartImageBuffer = await chartJSNodeCanvas.renderToBuffer(config);
  const chartPath = path.join(advancedReporting.dashboardDir, 'charts', 'error-types.png');
  await fs.writeFile(chartPath, chartImageBuffer);
  
  return path.relative(advancedReporting.dashboardDir, chartPath);
}

/**
 * Generate performance metrics chart
 * @param {number} runId - Test run ID
 * @returns {Promise<string>} - Path to the generated chart image
 */
async function generatePerformanceMetricsChart(runId) {
  // Get scenarios IDs for this run
  const scenarios = await advancedReporting.db.all(`
    SELECT scenario_id FROM scenarios WHERE run_id = ?
  `, [runId]);
  
  const scenarioIds = scenarios.map(s => s.scenario_id);
  
  // If no scenarios, return empty chart
  if (scenarioIds.length === 0) {
    return generateEmptyChart('performance-metrics.png', 'No Performance Metrics Available');
  }
  
  // Get performance metrics for these scenarios
  const metrics = await advancedReporting.db.all(`
    SELECT * FROM performance_metrics 
    WHERE scenario_id IN (${scenarioIds.join(',')})
    LIMIT 10
  `);
  
  // If no metrics, return empty chart
  if (metrics.length === 0) {
    return generateEmptyChart('performance-metrics.png', 'No Performance Metrics Available');
  }
  
  // Prepare chart data - radar chart for different metrics
  const data = {
    labels: metrics.map(m => truncateString(m.page_url || `Page ${m.metric_id}`, 30)),
    datasets: [
      {
        label: 'Load Time (ms)',
        data: metrics.map(m => m.load_time),
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)'
      },
      {
        label: 'DOM Content Loaded (ms)',
        data: metrics.map(m => m.dom_content_loaded),
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)'
      },
      {
        label: 'First Paint (ms)',
        data: metrics.map(m => m.first_paint),
        borderColor: '#ff9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)'
      },
      {
        label: 'Largest Contentful Paint (ms)',
        data: metrics.map(m => m.largest_contentful_paint),
        borderColor: '#f44336',
        backgroundColor: 'rgba(244, 67, 54, 0.1)'
      }
    ]
  };
  
  // Set up chart config
  const config = {
    type: 'line',
    data: data,
    options: {
      plugins: {
        title: {
          text: 'Page Performance Metrics'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };
  
  // Generate and save chart
  const chartImageBuffer = await chartJSNodeCanvas.renderToBuffer(config);
  const chartPath = path.join(advancedReporting.dashboardDir, 'charts', 'performance-metrics.png');
  await fs.writeFile(chartPath, chartImageBuffer);
  
  return path.relative(advancedReporting.dashboardDir, chartPath);
}

/**
 * Generate feature comparison chart
 * @param {number} runId - Test run ID
 * @returns {Promise<string>} - Path to the generated chart image
 */
async function generateFeatureComparisonChart(runId) {
  // Get scenarios grouped by feature
  const scenarios = await advancedReporting.db.all(`
    SELECT feature_name, status FROM scenarios WHERE run_id = ?
  `, [runId]);
  
  // Group by feature and count statuses
  const features = {};
  scenarios.forEach(s => {
    if (!s.feature_name) return;
    
    if (!features[s.feature_name]) {
      features[s.feature_name] = { passed: 0, failed: 0, skipped: 0, ambiguous: 0, total: 0 };
    }
    
    features[s.feature_name][s.status]++;
    features[s.feature_name].total++;
  });
  
  // Convert to arrays for charting
  const featureNames = Object.keys(features);
  const passedData = featureNames.map(f => features[f].passed);
  const failedData = featureNames.map(f => features[f].failed);
  const skippedData = featureNames.map(f => features[f].skipped);
  
  // If no features, return empty chart
  if (featureNames.length === 0) {
    return generateEmptyChart('feature-comparison.png', 'No Features Available');
  }
  
  // Prepare chart data
  const data = {
    labels: featureNames.map(f => truncateString(f, 20)),
    datasets: [
      {
        label: 'Passed',
        data: passedData,
        backgroundColor: '#4caf50'
      },
      {
        label: 'Failed',
        data: failedData,
        backgroundColor: '#f44336'
      },
      {
        label: 'Skipped',
        data: skippedData,
        backgroundColor: '#ff9800'
      }
    ]
  };
  
  // Set up chart config
  const config = {
    type: 'bar',
    data: data,
    options: {
      plugins: {
        title: {
          text: 'Feature Comparison'
        }
      },
      scales: {
        x: {
          stacked: true
        },
        y: {
          stacked: true,
          beginAtZero: true
        }
      }
    }
  };
  
  // Generate and save chart
  const chartImageBuffer = await chartJSNodeCanvas.renderToBuffer(config);
  const chartPath = path.join(advancedReporting.dashboardDir, 'charts', 'feature-comparison.png');
  await fs.writeFile(chartPath, chartImageBuffer);
  
  return path.relative(advancedReporting.dashboardDir, chartPath);
}

/**
 * Generate empty chart with a message
 * @param {string} filename - Chart filename
 * @param {string} message - Message to display
 * @returns {Promise<string>} - Path to the generated chart image
 */
async function generateEmptyChart(filename, message) {
  const config = {
    type: 'bar',
    data: {
      labels: [''],
      datasets: [{
        data: [0],
        backgroundColor: 'rgba(200, 200, 200, 0.2)'
      }]
    },
    options: {
      plugins: {
        title: {
          text: message
        }
      }
    }
  };
  
  // Generate and save chart
  const chartImageBuffer = await chartJSNodeCanvas.renderToBuffer(config);
  const chartPath = path.join(advancedReporting.dashboardDir, 'charts', filename);
  await fs.writeFile(chartPath, chartImageBuffer);
  
  return path.relative(advancedReporting.dashboardDir, chartPath);
}

/**
 * Generate HTML dashboard content
 * @param {number} runId - Test run ID
 * @param {...string} chartPaths - Paths to chart images
 * @returns {Promise<string>} - HTML content
 */
async function generateDashboardHtml(
  runId,
  passRateChartPath,
  trendsChartPath,
  durationChartPath,
  errorTypesChartPath,
  performanceMetricsChartPath,
  featureComparisonChartPath
) {
  // Get test run data
  const testRun = await advancedReporting.db.get('SELECT * FROM test_runs WHERE run_id = ?', [runId]);
  const scenarios = await advancedReporting.db.all('SELECT * FROM scenarios WHERE run_id = ?', [runId]);
  
  // Get failed scenarios with steps
  const failedScenarios = scenarios.filter(s => s.status === 'failed');
  for (const scenario of failedScenarios) {
    scenario.steps = await advancedReporting.db.all('SELECT * FROM steps WHERE scenario_id = ?', [scenario.scenario_id]);
  }
  
  // Calculate statistics
  const passRate = Math.round((testRun.passed_scenarios / testRun.total_scenarios) * 100);
  const duration = Math.round(testRun.duration / 1000); // Convert to seconds
  
  // Generate HTML
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Intelligent Automation Dashboard</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f8f9fa;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #4b0082, #9370db);
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 10px;
      margin-bottom: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .header p {
      margin: 5px 0 0;
      opacity: 0.8;
    }
    .dashboard-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .info-card {
      flex: 1;
      background: white;
      margin: 0 10px;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      text-align: center;
    }
    .info-card h3 {
      font-size: 14px;
      text-transform: uppercase;
      margin-bottom: 5px;
      color: #666;
    }
    .info-card .value {
      font-size: 24px;
      font-weight: bold;
    }
    .info-card.pass .value { color: #4caf50; }
    .info-card.fail .value { color: #f44336; }
    .info-card.skip .value { color: #ff9800; }
    .info-card.time .value { color: #2196f3; }
    .row {
      display: flex;
      margin: 0 -15px 30px;
    }
    .column {
      flex: 1;
      padding: 0 15px;
    }
    .card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      margin-bottom: 30px;
    }
    .card-header {
      padding: 15px 20px;
      background-color: #f5f5f5;
      border-bottom: 1px solid #eee;
    }
    .card-header h2 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }
    .card-body {
      padding: 20px;
    }
    .chart-container {
      text-align: center;
    }
    .chart-container img {
      max-width: 100%;
      height: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    table th, table td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    table th {
      background-color: #f5f5f5;
      font-weight: 600;
    }
    tr.failed {
      background-color: #fff5f5;
    }
    tr.passed {
      background-color: #f5fff5;
    }
    tr.skipped {
      background-color: #fffbf5;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .badge.pass { background-color: #e8f5e9; color: #2e7d32; }
    .badge.fail { background-color: #ffebee; color: #c62828; }
    .badge.skip { background-color: #fff3e0; color: #ef6c00; }
    .error-message {
      background-color: #fff0f0;
      padding: 10px;
      border-left: 2px solid #f44336;
      margin-top: 10px;
      font-family: monospace;
      font-size: 12px;
      overflow-x: auto;
      white-space: pre-wrap;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding: 20px;
      color: #666;
      font-size: 12px;
    }
    .tabs {
      display: flex;
      margin-bottom: 20px;
      border-bottom: 1px solid #ddd;
    }
    .tab {
      padding: 10px 20px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
    }
    .tab.active {
      border-bottom: 2px solid #4b0082;
      color: #4b0082;
      font-weight: bold;
    }
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
    }
    @media (max-width: 768px) {
      .row {
        flex-direction: column;
      }
      .dashboard-info {
        flex-wrap: wrap;
      }
      .info-card {
        flex: 0 0 calc(50% - 20px);
        margin-bottom: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Intelligent Automation Dashboard</h1>
      <p>Test Results - ${new Date(testRun.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="dashboard-info">
      <div class="info-card pass">
        <h3>Pass Rate</h3>
        <div class="value">${passRate}%</div>
      </div>
      <div class="info-card pass">
        <h3>Passed</h3>
        <div class="value">${testRun.passed_scenarios}</div>
      </div>
      <div class="info-card fail">
        <h3>Failed</h3>
        <div class="value">${testRun.failed_scenarios}</div>
      </div>
      <div class="info-card skip">
        <h3>Skipped</h3>
        <div class="value">${testRun.skipped_scenarios}</div>
      </div>
      <div class="info-card time">
        <h3>Duration</h3>
        <div class="value">${duration}s</div>
      </div>
    </div>
    
    <div class="tabs">
      <div class="tab active" data-tab="summary">Summary</div>
      <div class="tab" data-tab="features">Features</div>
      <div class="tab" data-tab="failures">Failures</div>
      <div class="tab" data-tab="performance">Performance</div>
      <div class="tab" data-tab="trends">Trends</div>
    </div>
    
    <div class="tab-content active" id="summary-tab">
      <div class="row">
        <div class="column">
          <div class="card">
            <div class="card-header">
              <h2>Test Summary</h2>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <img src="${passRateChartPath}" alt="Pass Rate Chart">
              </div>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="card">
            <div class="card-header">
              <h2>Error Types</h2>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <img src="${errorTypesChartPath}" alt="Error Types Chart">
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h2>Environment Information</h2>
        </div>
        <div class="card-body">
          <table>
            <tr>
              <th>Environment</th>
              <td>${testRun.environment || 'Unknown'}</td>
              <th>Browser</th>
              <td>${testRun.browser || 'Unknown'}</td>
            </tr>
            <tr>
              <th>Build Number</th>
              <td>${testRun.ci_build_number || 'N/A'}</td>
              <th>Git Branch</th>
              <td>${testRun.git_branch || 'N/A'}</td>
            </tr>
            <tr>
              <th>Git Commit</th>
              <td colspan="3">${testRun.git_commit || 'N/A'}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
    
    <div class="tab-content" id="features-tab">
      <div class="row">
        <div class="column">
          <div class="card">
            <div class="card-header">
              <h2>Feature Comparison</h2>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <img src="${featureComparisonChartPath}" alt="Feature Comparison Chart">
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h2>Execution Time by Scenario</h2>
        </div>
        <div class="card-body">
          <div class="chart-container">
            <img src="${durationChartPath}" alt="Duration Chart">
          </div>
        </div>
      </div>
    </div>
    
    <div class="tab-content" id="failures-tab">
      <div class="card">
        <div class="card-header">
          <h2>Failed Scenarios (${failedScenarios.length})</h2>
        </div>
        <div class="card-body">
          ${failedScenarios.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Scenario</th>
                <th>Status</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              ${failedScenarios.map(scenario => `
              <tr class="failed">
                <td>${scenario.feature_name}</td>
                <td>${scenario.scenario_name}</td>
                <td><span class="badge fail">Failed</span></td>
                <td>${Math.round(scenario.duration / 1000)}s</td>
              </tr>
              <tr>
                <td colspan="4">
                  <div class="error-message">${scenario.error_message || 'No error message provided'}</div>
                  <div class="steps">
                    ${scenario.steps ? scenario.steps.map(step => `
                      <div class="${step.status}">${step.step_text} - ${step.status}</div>
                    `).join('') : 'No steps information available'}
                  </div>
                </td>
              </tr>
              `).join('')}
            </tbody>
          </table>
          ` : '<p>No failures in this test run.</p>'}
        </div>
      </div>
    </div>
    
    <div class="tab-content" id="performance-tab">
      <div class="card">
        <div class="card-header">
          <h2>Performance Metrics</h2>
        </div>
        <div class="card-body">
          <div class="chart-container">
            <img src="${performanceMetricsChartPath}" alt="Performance Metrics Chart">
          </div>
        </div>
      </div>
    </div>
    
    <div class="tab-content" id="trends-tab">
      <div class="card">
        <div class="card-header">
          <h2>Historical Trends</h2>
        </div>
        <div class="card-body">
          <div class="chart-container">
            <img src="${trendsChartPath}" alt="Trends Chart">
          </div>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>Generated by Intelligent Automation Framework on ${new Date().toLocaleString()}</p>
    </div>
  </div>
  
  <script>
    // Simple tab functionality
    document.addEventListener('DOMContentLoaded', function() {
      const tabs = document.querySelectorAll('.tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', function() {
          // Remove active class from all tabs and contents
          document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
          
          // Add active class to clicked tab
          this.classList.add('active');
          
          // Show corresponding content
          const tabName = this.getAttribute('data-tab');
          document.getElementById(tabName + '-tab').classList.add('active');
        });
      });
    });
  </script>
</body>
</html>
`;
}

/**
 * Truncate string with ellipsis if it's too long
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated string
 */
function truncateString(str, maxLength) {
  if (!str) return '';
  return str.length > maxLength ? str.substring(0, maxLength - 3) + '...' : str;
}

// Execute if run directly
if (require.main === module) {
  generateDashboard().catch(console.error);
}

module.exports = { generateDashboard };

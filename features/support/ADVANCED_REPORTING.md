# Advanced Reporting Guide

This document provides comprehensive guidance on using the advanced reporting features in the Intelligent_Automation framework.

## Table of Contents
- [Overview](#overview)
- [Types of Reports](#types-of-reports)
- [Setting Up Advanced Reporting](#setting-up-advanced-reporting)
- [Generating Reports](#generating-reports)
- [Email Notifications](#email-notifications)
- [Customizing Reports](#customizing-reports)
- [Accessing Historical Data](#accessing-historical-data)
- [Performance Metrics](#performance-metrics)
- [Troubleshooting](#troubleshooting)

## Overview

The Intelligent_Automation framework includes a powerful advanced reporting system that goes beyond standard Cucumber reports. Our advanced reporting provides:

- Interactive dashboards with charts and visualizations
- Historical trend analysis of test results
- Performance metrics tracking and visualization
- PDF reports for sharing with stakeholders
- Email notifications with test result summaries
- Data persistence using SQLite database

## Types of Reports

### Interactive Dashboard
- HTML-based interactive dashboard with charts and statistics
- Multiple tabs for different views (summary, trends, failures, performance)
- Visual representations of test results and metrics
- Mobile-friendly responsive design

### PDF Report
- Professional-grade PDF report for sharing with stakeholders
- Comprehensive test summary with statistics
- Feature-by-feature breakdown of test results
- Detailed failure information with step-level reporting

### Email Notifications
- Automated email notifications after test execution
- Summary of test results with key metrics
- List of failed scenarios with error details
- Links to full reports and optional attachments

### Historical Trends
- Test results stored in a SQLite database
- Pass rate trends over time
- Identification of flaky tests
- Performance metrics evolution

## Setting Up Advanced Reporting

1. Ensure required dependencies are installed:
```bash
npm install
```

2. Configure email settings in your `.env` file:
```
ENABLE_EMAIL_REPORTS=true
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
EMAIL_FROM=automation@yourcompany.com
EMAIL_RECIPIENTS=team1@example.com,team2@example.com
```

3. Set up CI/CD environment variables (optional):
```
CI_BUILD_NUMBER=123
GIT_BRANCH=main
GIT_COMMIT=abc123
```

## Generating Reports

### All Reports
Generate all report types at once:
```bash
npm run report:generate
```

### Interactive Dashboard
Generate only the interactive HTML dashboard:
```bash
npm run report:dashboard
```
This creates an HTML dashboard at `reports/dashboard/index.html`.

### PDF Report
Generate only the PDF report:
```bash
npm run report:pdf
```
This creates a PDF report at `reports/test-report.pdf`.

### Email Report
Send an email report:
```bash
npm run report:email
```
This sends an email with test results to the configured recipients.

## Email Notifications

### Configuration
The email notification system uses nodemailer and requires SMTP configuration in your `.env` file.

### Email Content
The emails include:
- Summary statistics (pass rate, total scenarios, etc.)
- Environment information (browser, environment name)
- List of failed scenarios with error messages
- Execution duration and timestamp

### Attachments
The emails can include the following attachments:
- Dashboard HTML file
- Cucumber HTML report
- PDF test report

### Disabling Email Reports
To disable email reports, set `ENABLE_EMAIL_REPORTS=false` in your `.env` file.

## Customizing Reports

### Dashboard Customization
To customize the dashboard, edit the HTML template in `generateDashboard.js`.

### PDF Report Customization
To customize the PDF report, edit the Handlebars template at `templates/pdf-report-template.html`.

### Email Template Customization
To customize the email content, edit the HTML template in `sendEmailReport.js`.

## Accessing Historical Data

Test results are stored in a SQLite database at `reports/test_history.db`. You can access this database using any SQLite client.

### Database Schema
- `test_runs`: Information about test executions
- `scenarios`: Details about individual scenarios
- `steps`: Step-level information
- `performance_metrics`: Performance data collected during tests

### Sample Queries

Get pass rate trend over time:
```sql
SELECT 
  date(timestamp) as test_date,
  SUM(passed_scenarios) as total_passed,
  SUM(total_scenarios) as total_scenarios,
  ROUND((SUM(passed_scenarios) * 100.0 / SUM(total_scenarios)), 2) as pass_rate
FROM test_runs
GROUP BY test_date
ORDER BY test_date;
```

Identify flaky scenarios (those that sometimes pass, sometimes fail):
```sql
SELECT 
  feature_name, 
  scenario_name, 
  COUNT(*) as total_runs,
  SUM(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) as passed,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
  ROUND((SUM(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) as pass_rate
FROM scenarios
GROUP BY feature_name, scenario_name
HAVING passed > 0 AND failed > 0
ORDER BY pass_rate;
```

## Performance Metrics

The framework collects the following performance metrics:

- **Load Time**: Total page load time
- **DOM Content Loaded**: Time taken for DOM content to load
- **First Paint**: Time until first paint event
- **Largest Contentful Paint (LCP)**: Time for largest content element to render
- **First Input Delay (FID)**: Time before the page responds to user interaction
- **Cumulative Layout Shift (CLS)**: Visual stability measure
- **Total Blocking Time (TBT)**: Sum of time main thread is blocked
- **Resource Count**: Number of resources loaded
- **Resource Size**: Total size of resources loaded

### Collecting Performance Metrics

To collect performance metrics, use these steps in your feature files:

```gherkin
Given I enable performance metrics collection
When I navigate to "https://example.com"
And I collect performance metrics
Then the page load time should be less than 3000 milliseconds
```

### Performance Assertions

Available assertions include:
- `the page load time should be less than {int} milliseconds`
- `the DOM content loaded time should be less than {int} milliseconds`
- `the first paint time should be less than {int} milliseconds`
- `the largest contentful paint time should be less than {int} milliseconds`
- `the first input delay should be less than {int} milliseconds`
- `the cumulative layout shift should be less than {float}`
- `the total resource count should be less than {int}`
- `the total resource size should be less than {int} kilobytes`

## Troubleshooting

### Reports Not Generating
- Check if you have the necessary permissions to write to the reports directory
- Ensure all required dependencies are installed
- Check for errors in the console output

### Email Notifications Not Working
- Verify your SMTP settings in the `.env` file
- Check if your SMTP server requires authentication
- Try using a different port (587 or 465)
- Check if you need to enable "Less secure apps" for Gmail

### Database Errors
- Check if the database file exists at `reports/test_history.db`
- Ensure you have write permissions to the database file
- Backup and recreate the database if it becomes corrupted

### Missing Charts
- Ensure chartjs-node-canvas is correctly installed
- Check for console errors related to chart generation
- Verify that the charts directory exists and is writable

For any additional help, please file an issue in the repository.

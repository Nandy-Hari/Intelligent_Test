/**
 * Step definitions for performance testing in Intelligent_Automation framework
 */
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const performanceMetricsCollector = require('../support/reporting/performanceMetricsCollector');

// Enable performance metrics collection
Given('I enable performance metrics collection', function() {
  // Generate a unique scenario ID using timestamp and scenario name
  this.scenarioId = `${Date.now()}-${this.testCaseTitle || 'unknown'}`;
  performanceMetricsCollector.startCollection(this.scenarioId);
});

// Collect current page performance metrics
When('I collect performance metrics', async function() {
  if (!this.scenarioId) {
    throw new Error('Performance metrics collection not enabled. Use "I enable performance metrics collection" step first.');
  }
  await performanceMetricsCollector.collectMetrics(this.page, this.scenarioId);
});

// Verify page load time
Then('the page load time should be less than {int} milliseconds', async function(threshold) {
  if (!this.scenarioId) {
    throw new Error('Performance metrics collection not enabled. Use "I enable performance metrics collection" step first.');
  }
  
  const metrics = performanceMetricsCollector.getMetrics(this.scenarioId);
  expect(metrics.loadTime).toBeLessThan(threshold);
});

// Verify DOM content loaded time
Then('the DOM content loaded time should be less than {int} milliseconds', async function(threshold) {
  if (!this.scenarioId) {
    throw new Error('Performance metrics collection not enabled. Use "I enable performance metrics collection" step first.');
  }
  
  const metrics = performanceMetricsCollector.getMetrics(this.scenarioId);
  expect(metrics.domContentLoaded).toBeLessThan(threshold);
});

// Verify first paint time
Then('the first paint time should be less than {int} milliseconds', async function(threshold) {
  if (!this.scenarioId) {
    throw new Error('Performance metrics collection not enabled. Use "I enable performance metrics collection" step first.');
  }
  
  const metrics = performanceMetricsCollector.getMetrics(this.scenarioId);
  expect(metrics.firstPaint).toBeLessThan(threshold);
});

// Verify largest contentful paint time
Then('the largest contentful paint time should be less than {int} milliseconds', async function(threshold) {
  if (!this.scenarioId) {
    throw new Error('Performance metrics collection not enabled. Use "I enable performance metrics collection" step first.');
  }
  
  const metrics = performanceMetricsCollector.getMetrics(this.scenarioId);
  expect(metrics.largestContentfulPaint).toBeLessThan(threshold);
});

// Verify first input delay time
Then('the first input delay should be less than {int} milliseconds', async function(threshold) {
  if (!this.scenarioId) {
    throw new Error('Performance metrics collection not enabled. Use "I enable performance metrics collection" step first.');
  }
  
  const metrics = performanceMetricsCollector.getMetrics(this.scenarioId);
  expect(metrics.firstInputDelay).toBeLessThan(threshold);
});

// Verify cumulative layout shift
Then('the cumulative layout shift should be less than {float}', async function(threshold) {
  if (!this.scenarioId) {
    throw new Error('Performance metrics collection not enabled. Use "I enable performance metrics collection" step first.');
  }
  
  const metrics = performanceMetricsCollector.getMetrics(this.scenarioId);
  expect(metrics.cumulativeLayoutShift).toBeLessThan(threshold);
});

// Verify total resource count
Then('the total resource count should be less than {int}', async function(threshold) {
  if (!this.scenarioId) {
    throw new Error('Performance metrics collection not enabled. Use "I enable performance metrics collection" step first.');
  }
  
  const metrics = performanceMetricsCollector.getMetrics(this.scenarioId);
  expect(metrics.resourceCount).toBeLessThan(threshold);
});

// Verify total resource size
Then('the total resource size should be less than {int} kilobytes', async function(threshold) {
  if (!this.scenarioId) {
    throw new Error('Performance metrics collection not enabled. Use "I enable performance metrics collection" step first.');
  }
  
  const metrics = performanceMetricsCollector.getMetrics(this.scenarioId);
  const sizeInKB = metrics.resourceSize / 1024;
  expect(sizeInKB).toBeLessThan(threshold);
});

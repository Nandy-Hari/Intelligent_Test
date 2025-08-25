/**
 * Step definitions for database testing in Intelligent_Automation framework
 */
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const DbClient = require('../support/db/dbClient');

// Initialize DB client
Given('I connect to {string} database with:', async function(dbType, dataTable) {
  const config = {};
  dataTable.rows().forEach(row => {
    config[row[0]] = row[1];
  });
  
  this.dbClient = new DbClient(dbType);
  await this.dbClient.createPool(config);
});

// Query execution
When('I execute the query:', async function(docString) {
  this.queryResults = await this.dbClient.executeQuery(docString);
});

When('I execute the query with parameters:', async function(docString, dataTable) {
  const params = dataTable.rows().map(row => row[0]);
  this.queryResults = await this.dbClient.executeQuery(docString, params);
});

When('I execute the update:', async function(docString) {
  this.updateResult = await this.dbClient.executeUpdate(docString);
});

When('I execute the update with parameters:', async function(docString, dataTable) {
  const params = dataTable.rows().map(row => row[0]);
  this.updateResult = await this.dbClient.executeUpdate(docString, params);
});

// Transaction management
When('I begin a database transaction', async function() {
  await this.dbClient.beginTransaction();
});

When('I commit the transaction', async function() {
  await this.dbClient.commitTransaction();
});

When('I rollback the transaction', async function() {
  await this.dbClient.rollbackTransaction();
});

// Result verification
Then('the query should return {int} rows', function(rowCount) {
  expect(this.queryResults.length).toBe(rowCount);
});

Then('the query should return at least {int} rows', function(minRowCount) {
  expect(this.queryResults.length).toBeGreaterThanOrEqual(minRowCount);
});

Then('the query result should contain a row with:', function(dataTable) {
  const expectedRow = {};
  dataTable.rows().forEach(row => {
    expectedRow[row[0]] = row[1];
  });

  const foundRow = this.queryResults.find(row => {
    return Object.entries(expectedRow).every(([key, value]) => {
      // Convert both to string for comparison to handle different data types
      return String(row[key]) === String(value);
    });
  });

  expect(foundRow).toBeTruthy();
});

Then('the query result at index {int} should have values:', function(index, dataTable) {
  const row = this.queryResults[index];
  expect(row).toBeTruthy();

  dataTable.rows().forEach(([field, expectedValue]) => {
    expect(String(row[field])).toBe(expectedValue);
  });
});

Then('the update should affect {int} rows', function(rowCount) {
  expect(this.updateResult.affectedRows).toBe(rowCount);
});

// Record existence verification
Then('a record should exist in table {string} with:', async function(table, dataTable) {
  const criteria = {};
  dataTable.rows().forEach(row => {
    criteria[row[0]] = row[1];
  });
  
  const exists = await this.dbClient.recordExists(table, criteria);
  expect(exists).toBe(true);
});

Then('no record should exist in table {string} with:', async function(table, dataTable) {
  const criteria = {};
  dataTable.rows().forEach(row => {
    criteria[row[0]] = row[1];
  });
  
  const exists = await this.dbClient.recordExists(table, criteria);
  expect(exists).toBe(false);
});

// Data storage
When('I store query result field {string} at index {int} as {string}', function(field, index, variableName) {
  if (!this.variables) {
    this.variables = {};
  }
  
  if (!this.queryResults || !this.queryResults[index]) {
    throw new Error(`No query result found at index ${index}`);
  }
  
  this.variables[variableName] = this.queryResults[index][field];
});

// Performance check
Then('the query execution time should be less than {int} ms', function(maxTime) {
  expect(this.dbClient.getQueryTime()).toBeLessThan(maxTime);
});

// Clean up
// Temporarily fixed to run login tests
const { After } = require('@cucumber/cucumber');

After(async function() {
  if (this.dbClient) {
    await this.dbClient.close();
  }
});

/**
 * Step definitions for API testing in Intelligent_Automation framework
 */
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const ApiClient = require('../support/api/apiClient');

// Initialize API client
Given('I initialize API client with base URL {string}', function(baseUrl) {
  this.apiClient = new ApiClient(baseUrl);
});

// Authentication
Given('I set {string} authentication with {string}', function(authType, credentials) {
  if (!this.apiClient) {
    this.apiClient = new ApiClient();
  }
  this.apiClient.setAuth(authType, credentials);
});

// Headers
Given('I set request header {string} to {string}', function(name, value) {
  if (!this.apiClient) {
    this.apiClient = new ApiClient();
  }
  this.apiClient.setHeader(name, value);
});

// Request execution
When('I send a GET request to {string}', async function(endpoint) {
  try {
    await this.apiClient.get(endpoint);
  } catch (error) {
    // We still want to continue the test to validate the error response
    this.error = error;
  }
});

When('I send a GET request to {string} with parameters:', async function(endpoint, dataTable) {
  const params = {};
  dataTable.hashes().forEach(row => {
    params[row.parameter] = row.value;
  });
  
  try {
    await this.apiClient.get(endpoint, params);
  } catch (error) {
    this.error = error;
  }
});

When('I send a POST request to {string} with body:', async function(endpoint, docString) {
  try {
    const requestBody = JSON.parse(docString);
    await this.apiClient.post(endpoint, requestBody);
  } catch (error) {
    this.error = error;
  }
});

When('I send a PUT request to {string} with body:', async function(endpoint, docString) {
  try {
    const requestBody = JSON.parse(docString);
    await this.apiClient.put(endpoint, requestBody);
  } catch (error) {
    this.error = error;
  }
});

When('I send a DELETE request to {string}', async function(endpoint) {
  try {
    await this.apiClient.delete(endpoint);
  } catch (error) {
    this.error = error;
  }
});

When('I send a PATCH request to {string} with body:', async function(endpoint, docString) {
  try {
    const requestBody = JSON.parse(docString);
    await this.apiClient.patch(endpoint, requestBody);
  } catch (error) {
    this.error = error;
  }
});

// Response validation
Then('the response status code should be {int}', function(statusCode) {
  if (this.apiClient.response) {
    expect(this.apiClient.response.status).toBe(statusCode);
  } else {
    throw new Error('No API response received');
  }
});

Then('the response should contain {string}', function(expectedText) {
  const responseBody = JSON.stringify(this.apiClient.response.data);
  expect(responseBody).toContain(expectedText);
});

Then('the response should have a field {string} with value {string}', function(field, expectedValue) {
  const value = this.apiClient.getResponseValue(field);
  expect(String(value)).toBe(expectedValue);
});

Then('the response should have a field {string} that contains {string}', function(field, expectedSubstring) {
  const value = this.apiClient.getResponseValue(field);
  expect(String(value)).toContain(expectedSubstring);
});

Then('the response time should be less than {int} ms', function(maxTime) {
  expect(this.apiClient.getResponseTime()).toBeLessThan(maxTime);
});

Then('the response should match schema:', function(docString) {
  const schema = JSON.parse(docString);
  this.apiClient.validateJsonSchema(schema);
});

Then('the response header {string} should be {string}', function(headerName, expectedValue) {
  expect(this.apiClient.response.headers[headerName.toLowerCase()]).toBe(expectedValue);
});

// Extract and store response data
When('I store the value of response field {string} as {string}', function(field, variableName) {
  const value = this.apiClient.getResponseValue(field);
  if (!this.variables) {
    this.variables = {};
  }
  this.variables[variableName] = value;
});

// Use stored variables
When('I send a GET request to {string} with stored variable {string}', async function(endpointTemplate, variableName) {
  const endpoint = endpointTemplate.replace(`{${variableName}}`, this.variables[variableName]);
  try {
    await this.apiClient.get(endpoint);
  } catch (error) {
    this.error = error;
  }
});

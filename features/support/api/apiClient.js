/**
 * API Client for Intelligent_Automation framework
 * Handles REST API requests and responses with support for various authentication methods
 * (Temporarily modified to remove axios dependency for login tests)
 */
// const axios = require('axios'); - temporarily commented out
const { expect } = require('@playwright/test');

class ApiClient {
  constructor(baseUrl = '', headers = {}) {
    this.baseUrl = baseUrl;
    this.headers = headers;
    this.response = null;
    this.request = null;
    this.responseTime = 0;
  }

  /**
   * Sets the base URL for API requests
   * @param {string} baseUrl - The base URL for API requests
   */
  setBaseUrl(baseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Sets authentication headers
   * @param {string} type - Authentication type (bearer, basic, apikey)
   * @param {string} credentials - Authentication credentials
   */
  setAuth(type, credentials) {
    switch (type.toLowerCase()) {
      case 'bearer':
        this.headers['Authorization'] = `Bearer ${credentials}`;
        break;
      case 'basic':
        this.headers['Authorization'] = `Basic ${Buffer.from(credentials).toString('base64')}`;
        break;
      case 'apikey':
        this.headers['X-API-Key'] = credentials;
        break;
      default:
        throw new Error(`Unsupported authentication type: ${type}`);
    }
  }

  /**
   * Sets a custom header
   * @param {string} name - Header name
   * @param {string} value - Header value
   */
  setHeader(name, value) {
    this.headers[name] = value;
  }

  /**
   * Makes a GET request to the specified endpoint
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - API response
   */
  async get(endpoint, params = {}) {
    try {
      this.request = { method: 'GET', url: `${this.baseUrl}${endpoint}`, params };
      const startTime = Date.now();
      this.response = await axios.get(`${this.baseUrl}${endpoint}`, {
        params,
        headers: this.headers
      });
      this.responseTime = Date.now() - startTime;
      return this.response;
    } catch (error) {
      this.response = error.response;
      throw error;
    }
  }

  /**
   * Makes a POST request to the specified endpoint
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request payload
   * @returns {Promise<Object>} - API response
   */
  async post(endpoint, data = {}) {
    try {
      this.request = { method: 'POST', url: `${this.baseUrl}${endpoint}`, data };
      const startTime = Date.now();
      this.response = await axios.post(`${this.baseUrl}${endpoint}`, data, {
        headers: this.headers
      });
      this.responseTime = Date.now() - startTime;
      return this.response;
    } catch (error) {
      this.response = error.response;
      throw error;
    }
  }

  /**
   * Makes a PUT request to the specified endpoint
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request payload
   * @returns {Promise<Object>} - API response
   */
  async put(endpoint, data = {}) {
    try {
      this.request = { method: 'PUT', url: `${this.baseUrl}${endpoint}`, data };
      const startTime = Date.now();
      this.response = await axios.put(`${this.baseUrl}${endpoint}`, data, {
        headers: this.headers
      });
      this.responseTime = Date.now() - startTime;
      return this.response;
    } catch (error) {
      this.response = error.response;
      throw error;
    }
  }

  /**
   * Makes a DELETE request to the specified endpoint
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>} - API response
   */
  async delete(endpoint) {
    try {
      this.request = { method: 'DELETE', url: `${this.baseUrl}${endpoint}` };
      const startTime = Date.now();
      this.response = await axios.delete(`${this.baseUrl}${endpoint}`, {
        headers: this.headers
      });
      this.responseTime = Date.now() - startTime;
      return this.response;
    } catch (error) {
      this.response = error.response;
      throw error;
    }
  }

  /**
   * Makes a PATCH request to the specified endpoint
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request payload
   * @returns {Promise<Object>} - API response
   */
  async patch(endpoint, data = {}) {
    try {
      this.request = { method: 'PATCH', url: `${this.baseUrl}${endpoint}`, data };
      const startTime = Date.now();
      this.response = await axios.patch(`${this.baseUrl}${endpoint}`, data, {
        headers: this.headers
      });
      this.responseTime = Date.now() - startTime;
      return this.response;
    } catch (error) {
      this.response = error.response;
      throw error;
    }
  }

  /**
   * Validates JSON response against a schema
   * @param {Object} schema - JSON schema
   * @returns {boolean} - Whether validation passed
   */
  validateJsonSchema(schema) {
    const Ajv = require('ajv');
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(this.response.data);
    if (!valid) {
      throw new Error(`Schema validation failed: ${JSON.stringify(validate.errors)}`);
    }
    return valid;
  }

  /**
   * Validates response status code
   * @param {number} expectedStatusCode - Expected status code
   */
  validateStatus(expectedStatusCode) {
    expect(this.response.status).toBe(expectedStatusCode);
  }

  /**
   * Gets the response time in milliseconds
   * @returns {number} - Response time in ms
   */
  getResponseTime() {
    return this.responseTime;
  }

  /**
   * Gets a value from the response body by path
   * @param {string} path - Path to the value (dot notation)
   * @returns {any} - Value at the path
   */
  getResponseValue(path) {
    const lodash = require('lodash');
    return lodash.get(this.response.data, path);
  }
}

module.exports = ApiClient;

const { BasePage } = require('../support/basePage');

/**
 * SauceDemo Login Page
 * Handles login functionality for the SauceDemo website
 */
class SauceDemoLoginPage extends BasePage {
  /**
   * Constructor for SauceDemo Login Page
   * @param {Object} page - Playwright page object
   */
  constructor(page) {
    super(page);
    // Selectors
    this.usernameField = '[data-test="username"]';
    this.passwordField = '[data-test="password"]';
    this.loginButton = '[data-test="login-button"]';
    this.errorMessage = '[data-test="error"]';
    this.url = 'https://www.saucedemo.com/';
  }

  /**
   * Navigate to the login page
   */
  async navigateToLoginPage() {
    await this.navigateTo(this.url);
  }

  /**
   * Login with provided credentials
   * @param {string} username - Username to use
   * @param {string} password - Password to use
   */
  async login(username, password) {
    await this.fillText(this.usernameField, username);
    await this.fillText(this.passwordField, password);
    await this.clickElement(this.loginButton);
  }

  /**
   * Get the error message text
   * @returns {string} The error message text
   */
  async getErrorMessage() {
    return await this.getText(this.errorMessage);
  }
}

module.exports = { SauceDemoLoginPage };

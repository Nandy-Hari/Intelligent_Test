const { BasePage } = require('../support/basePage');

/**
 * SauceDemo Checkout Page
 * Handles checkout process for the SauceDemo website
 */
class SauceDemoCheckoutPage extends BasePage {
  /**
   * Constructor for SauceDemo Checkout Page
   * @param {Object} page - Playwright page object
   */
  constructor(page) {
    super(page);
    // Selectors for checkout information
    this.firstNameField = '[data-test="firstName"]';
    this.lastNameField = '[data-test="lastName"]';
    this.postalCodeField = '[data-test="postalCode"]';
    this.continueButton = '[data-test="continue"]';
    this.cancelButton = '[data-test="cancel"]';
    this.errorMessage = '[data-test="error"]';
    
    // Selectors for checkout overview
    this.finishButton = '[data-test="finish"]';
    this.cancelOverviewButton = '[data-test="cancel"]';
    this.inventoryItem = '.inventory_item_name';
    this.itemPrice = '.inventory_item_price';
    this.summarySubtotal = '.summary_subtotal_label';
    this.summaryTax = '.summary_tax_label';
    this.summaryTotal = '.summary_total_label';
    
    // Selectors for checkout complete
    this.completeHeader = '.complete-header';
    this.completeText = '.complete-text';
    this.backHomeButton = '[data-test="back-to-products"]';
    
    // Page URLs
    this.checkoutUrl = 'https://www.saucedemo.com/checkout-step-one.html';
    this.overviewUrl = 'https://www.saucedemo.com/checkout-step-two.html';
    this.completeUrl = 'https://www.saucedemo.com/checkout-complete.html';
  }

  /**
   * Navigate to the checkout page (step one)
   */
  async navigateToCheckout() {
    await this.navigateTo(this.checkoutUrl);
  }

  /**
   * Fill out customer information
   * @param {string} firstName - Customer's first name
   * @param {string} lastName - Customer's last name
   * @param {string} postalCode - Customer's postal code
   */
  async fillCustomerInfo(firstName, lastName, postalCode) {
    await this.fillText(this.firstNameField, firstName);
    await this.fillText(this.lastNameField, lastName);
    await this.fillText(this.postalCodeField, postalCode);
  }

  /**
   * Continue to the next checkout step
   */
  async continueToOverview() {
    await this.clickElement(this.continueButton);
  }

  /**
   * Cancel checkout and return to cart
   */
  async cancelCheckout() {
    await this.clickElement(this.cancelButton);
  }

  /**
   * Get error message if present
   * @returns {string} The error message text
   */
  async getErrorMessage() {
    return await this.getText(this.errorMessage);
  }

  /**
   * Get all item names in the checkout overview
   * @returns {Array<string>} Array of item names
   */
  async getOverviewItemNames() {
    return await this.page.$$eval(this.inventoryItem, elements => 
      elements.map(el => el.textContent.trim())
    );
  }

  /**
   * Get the subtotal amount
   * @returns {string} The subtotal amount
   */
  async getSubtotal() {
    return await this.getText(this.summarySubtotal);
  }

  /**
   * Get the tax amount
   * @returns {string} The tax amount
   */
  async getTax() {
    return await this.getText(this.summaryTax);
  }

  /**
   * Get the total amount
   * @returns {string} The total amount
   */
  async getTotal() {
    return await this.getText(this.summaryTotal);
  }

  /**
   * Complete the purchase
   */
  async finishPurchase() {
    await this.clickElement(this.finishButton);
  }

  /**
   * Get the completion message
   * @returns {string} The completion header text
   */
  async getCompletionMessage() {
    return await this.getText(this.completeHeader);
  }

  /**
   * Return to home/products page after purchase
   */
  async backToHome() {
    await this.clickElement(this.backHomeButton);
  }
}

module.exports = { SauceDemoCheckoutPage };

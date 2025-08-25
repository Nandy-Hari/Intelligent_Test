const { BasePage } = require('../support/basePage');
const { SauceDemoLoginPage } = require('./SauceDemoLoginPage');
const { SauceDemoProductsPage } = require('./SauceDemoProductsPage');
const { SauceDemoCartPage } = require('./SauceDemoCartPage');
const { SauceDemoCheckoutPage } = require('./SauceDemoCheckoutPage');

/**
 * SauceDemo Page
 * Main page object that combines all SauceDemo page objects for easier management
 */
class SauceDemoPage extends BasePage {
  /**
   * Constructor for SauceDemo Page
   * @param {Object} page - Playwright page object
   */
  constructor(page) {
    super(page);
    this.login = new SauceDemoLoginPage(page);
    this.products = new SauceDemoProductsPage(page);
    this.cart = new SauceDemoCartPage(page);
    this.checkout = new SauceDemoCheckoutPage(page);
    this.url = 'https://www.saucedemo.com/';
  }

  /**
   * Navigate to SauceDemo homepage
   */
  async navigateToHomepage() {
    await this.navigateTo(this.url);
  }

  /**
   * Complete login process
   * @param {string} username - Username to use
   * @param {string} password - Password to use
   */
  async loginToSauceDemo(username, password) {
    await this.login.login(username, password);
  }

  /**
   * Add a product to the cart
   * @param {string} productName - Name of the product to add
   */
  async addProductToCart(productName) {
    await this.products.addProductToCart(productName);
  }

  /**
   * Go to cart and complete checkout
   * @param {Object} customerInfo - Customer information for checkout
   * @param {string} customerInfo.firstName - Customer's first name
   * @param {string} customerInfo.lastName - Customer's last name
   * @param {string} customerInfo.postalCode - Customer's postal code
   */
  async completeCheckout(customerInfo) {
    await this.products.goToCart();
    await this.cart.proceedToCheckout();
    await this.checkout.fillCustomerInfo(
      customerInfo.firstName,
      customerInfo.lastName,
      customerInfo.postalCode
    );
    await this.checkout.continueToOverview();
    await this.checkout.finishPurchase();
  }
}

module.exports = { SauceDemoPage };

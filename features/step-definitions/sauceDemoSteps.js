const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

/**
 * SauceDemo specific steps that aren't covered by common steps
 */

// Cart badge verification
Then('I should see {string} in the cart badge', async function(count) {
  const productsPage = await this.pageObjectManager.getPage('saucedemo products');
  const badgeCount = await productsPage.getCartBadgeCount();
  expect(badgeCount).toBe(count);
});

// Cart icon click
When('I click on the cart icon', async function() {
  const productsPage = await this.pageObjectManager.getPage('saucedemo products');
  await productsPage.goToCart();
});

// Add to cart for specific product
When('I click on {string} for {string}', async function(action, productName) {
  if (action === 'Add to cart') {
    const productsPage = await this.pageObjectManager.getPage('saucedemo products');
    await productsPage.addProductToCart(productName);
  } else if (action === 'Remove') {
    const productsPage = await this.pageObjectManager.getPage('saucedemo products');
    await productsPage.removeProductFromCart(productName);
  } else {
    throw new Error(`Action ${action} is not supported for ${productName}`);
  }
});

// Product sorting
When('I sort products by {string}', async function(sortOption) {
  const productsPage = await this.pageObjectManager.getPage('saucedemo products');
  await productsPage.sortProductsBy(sortOption);
});

// Complete checkout with default information
When('I complete checkout with default information', async function() {
  const sauceDemoPage = await this.pageObjectManager.getPage('saucedemo');
  const customerInfo = {
    firstName: 'John',
    lastName: 'Doe',
    postalCode: '12345'
  };
  await sauceDemoPage.completeCheckout(customerInfo);
});

// Complete checkout with custom information
When('I complete checkout with {string}, {string}, and {string}', async function(firstName, lastName, postalCode) {
  const cartPage = await this.pageObjectManager.getPage('saucedemo cart');
  const checkoutPage = await this.pageObjectManager.getPage('saucedemo checkout');
  
  await cartPage.proceedToCheckout();
  await checkoutPage.fillCustomerInfo(firstName, lastName, postalCode);
  await checkoutPage.continueToOverview();
  await checkoutPage.finishPurchase();
});

// Login with provided credentials
When('I login as {string} with password {string}', async function(username, password) {
  const loginPage = await this.pageObjectManager.getPage('saucedemo login');
  await loginPage.login(username, password);
});

// Verify cart items
Then('my cart should contain {string}', async function(productName) {
  const cartPage = await this.pageObjectManager.getPage('saucedemo cart');
  const itemNames = await cartPage.getCartItemNames();
  expect(itemNames).toContain(productName);
});

// Verify cart count
Then('my cart should have {int} item(s)', async function(count) {
  const cartPage = await this.pageObjectManager.getPage('saucedemo cart');
  const itemNames = await cartPage.getCartItemNames();
  expect(itemNames.length).toBe(count);
});

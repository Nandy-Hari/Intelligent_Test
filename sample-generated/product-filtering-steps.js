const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

/**
 * Custom step definitions for product filtering
 */

/**
 * Verify that products are sorted by price in ascending order
 */
Then('products should be sorted by price in ascending order', async function() {
  const productsPage = await this.pageObjectManager.getPage('saucedemo products');
  const prices = await productsPage.getAllProductPrices();
  
  // Convert prices from "$7.99" format to numbers for comparison
  const numericPrices = prices.map(price => parseFloat(price.replace('$', '')));
  
  // Check if array is sorted
  const isSorted = numericPrices.every((price, index, array) => {
    return index === 0 || price >= array[index - 1];
  });
  
  expect(isSorted).toBe(true, `Products are not sorted by price: ${numericPrices.join(', ')}`);
});

/**
 * Verify that the first product is cheaper than the last product
 */
Then('the first product should be cheaper than the last product', async function() {
  const productsPage = await this.pageObjectManager.getPage('saucedemo products');
  const prices = await productsPage.getAllProductPrices();
  
  // Get first and last prices
  const firstPrice = parseFloat(prices[0].replace('$', ''));
  const lastPrice = parseFloat(prices[prices.length - 1].replace('$', ''));
  
  expect(firstPrice).toBeLessThanOrEqual(lastPrice, 
    `First product price ($${firstPrice}) is not cheaper than last product price ($${lastPrice})`);
});

/**
 * Click on the first product in the list
 */
When('I click on the first product', async function() {
  const productsPage = await this.pageObjectManager.getPage('saucedemo products');
  const productNames = await productsPage.getAllProductNames();
  
  if (productNames.length > 0) {
    // Click on the first product by name
    await this.page.click(`.inventory_item_name:has-text("${productNames[0]}")`);
  } else {
    throw new Error('No products found on the page');
  }
});

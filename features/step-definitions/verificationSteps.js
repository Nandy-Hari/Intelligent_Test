const { Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Text verification
Then('I should see {string}', async function (text) {
  const element = this.page.locator(`text=${text}`).first();
  await expect(element).toBeVisible({ timeout: 30000 });
});

Then('I should see text {string}', async function (text) {
  const element = this.page.locator(`text=${text}`).first();
  await expect(element).toBeVisible({ timeout: 30000 });
});

Then('I should not see {string}', async function (text) {
  const element = this.page.locator(`text=${text}`).first();
  await expect(element).not.toBeVisible({ timeout: 10000 });
});

Then('the page title should be {string}', async function (expectedTitle) {
  await expect(this.page).toHaveTitle(expectedTitle);
});

Then('the page title should contain {string}', async function (titleText) {
  await expect(this.page).toHaveTitle(new RegExp(titleText, 'i'));
});

// URL verification
Then('the URL should be {string}', async function (expectedUrl) {
  await expect(this.page).toHaveURL(expectedUrl);
});

Then('the URL should contain {string}', async function (urlPart) {
  await expect(this.page).toHaveURL(new RegExp(urlPart));
});

// Element existence verification
Then('the {string} element should be visible', async function (elementText) {
  const selectors = [
    `text=${elementText}`,
    `[aria-label="${elementText}"]`,
    `[title="${elementText}"]`,
    `[alt="${elementText}"]`,
    `#${elementText}`,
    `.${elementText}`,
    `button:has-text("${elementText}")`,
    `a:has-text("${elementText}")`
  ];
  
  let found = false;
  for (const selector of selectors) {
    try {
      const element = this.page.locator(selector).first();
      await expect(element).toBeVisible({ timeout: 5000 });
      found = true;
      break;
    } catch {
      continue;
    }
  }
  
  if (!found) {
    throw new Error(`Element not found or not visible: ${elementText}`);
  }
});

Then('the {string} element should not be visible', async function (elementText) {
  const element = this.page.locator(`text=${elementText}`).first();
  await expect(element).not.toBeVisible({ timeout: 10000 });
});

Then('the {string} button should be enabled', async function (buttonText) {
  const button = this.page.locator(`button:has-text("${buttonText}")`);
  await expect(button).toBeEnabled();
});

Then('the {string} button should be disabled', async function (buttonText) {
  const button = this.page.locator(`button:has-text("${buttonText}")`);
  await expect(button).toBeDisabled();
});

// Field verification
Then('the {string} field should contain {string}', async function (fieldName, expectedValue) {
  const selectors = [
    `input[name="${fieldName}"]`,
    `input[id="${fieldName}"]`,
    `textarea[name="${fieldName}"]`,
    `textarea[id="${fieldName}"]`,
    `[aria-label*="${fieldName}"]`
  ];
  
  let verified = false;
  for (const selector of selectors) {
    try {
      const element = this.page.locator(selector);
      await expect(element).toHaveValue(expectedValue, { timeout: 5000 });
      verified = true;
      break;
    } catch {
      continue;
    }
  }
  
  if (!verified) {
    throw new Error(`Could not verify field value for: ${fieldName}`);
  }
});

Then('the {string} field should be empty', async function (fieldName) {
  const selectors = [
    `input[name="${fieldName}"]`,
    `input[id="${fieldName}"]`,
    `textarea[name="${fieldName}"]`,
    `textarea[id="${fieldName}"]`
  ];
  
  let verified = false;
  for (const selector of selectors) {
    try {
      const element = this.page.locator(selector);
      await expect(element).toHaveValue('', { timeout: 5000 });
      verified = true;
      break;
    } catch {
      continue;
    }
  }
  
  if (!verified) {
    throw new Error(`Could not verify field is empty: ${fieldName}`);
  }
});

// Count verification
Then('I should see at least {int} search results', async function (expectedCount) {
  const resultSelectors = [
    '.search-result',
    '[data-testid*="result"]',
    '.result',
    '[class*="result"]',
    '.g', // Google results
    '[data-component-type="s-search-result"]' // Amazon results
  ];
  
  let found = false;
  for (const selector of resultSelectors) {
    try {
      const elements = this.page.locator(selector);
      const count = await elements.count();
      if (count >= expectedCount) {
        found = true;
        break;
      }
    } catch {
      continue;
    }
  }
  
  if (!found) {
    throw new Error(`Expected at least ${expectedCount} results, but found fewer`);
  }
});

Then('I should see exactly {int} items', async function (expectedCount) {
  // This is a generic step that can be customized based on context
  const itemSelectors = [
    '.item',
    '[class*="item"]',
    '.product',
    '.result',
    'li'
  ];
  
  let found = false;
  for (const selector of itemSelectors) {
    try {
      const elements = this.page.locator(selector);
      const count = await elements.count();
      if (count === expectedCount) {
        found = true;
        break;
      }
    } catch {
      continue;
    }
  }
  
  if (!found) {
    throw new Error(`Expected exactly ${expectedCount} items`);
  }
});

// Attribute verification
Then('the {string} element should have {string} attribute with value {string}', async function (elementText, attributeName, expectedValue) {
  const element = this.page.locator(`text=${elementText}`).first();
  await expect(element).toHaveAttribute(attributeName, expectedValue);
});

// CSS verification
Then('the {string} element should have {string} CSS property with value {string}', async function (elementText, cssProperty, expectedValue) {
  const element = this.page.locator(`text=${elementText}`).first();
  await expect(element).toHaveCSS(cssProperty, expectedValue);
});

// Alert verification
Then('I should see an alert with message {string}', async function (expectedMessage) {
  this.page.on('dialog', async dialog => {
    expect(dialog.message()).toBe(expectedMessage);
    await dialog.accept();
  });
});

// Custom verification for specific pages
Then('I should see Google search results', async function () {
  if (this.currentPage && this.currentPage.constructor.name === 'GooglePage') {
    const resultsCount = await this.currentPage.getSearchResultsCount();
    expect(resultsCount).toBeGreaterThan(0);
  } else {
    await expect(this.page.locator('#search .g')).toHaveCount({ min: 1 });
  }
});

Then('I should see GitHub repositories', async function () {
  if (this.currentPage && this.currentPage.constructor.name === 'GitHubPage') {
    const repoCount = await this.currentPage.getRepositoryCount();
    expect(repoCount).toBeGreaterThan(0);
  } else {
    await expect(this.page.locator('[data-testid="results-list"] .repo-list-item')).toHaveCount({ min: 1 });
  }
});

Then('I should see Amazon products', async function () {
  if (this.currentPage && this.currentPage.constructor.name === 'AmazonPage') {
    const resultsCount = await this.currentPage.getSearchResultsCount();
    expect(resultsCount).toBeGreaterThan(0);
  } else {
    await expect(this.page.locator('[data-component-type="s-search-result"]')).toHaveCount({ min: 1 });
  }
});

// Network and performance verification
Then('the page should load within {int} seconds', async function (seconds) {
  const startTime = Date.now();
  await this.page.waitForLoadState('networkidle');
  const loadTime = (Date.now() - startTime) / 1000;
  expect(loadTime).toBeLessThanOrEqual(seconds);
});

// Screenshot verification
Then('I take a screenshot named {string}', async function (screenshotName) {
  await this.page.screenshot({ 
    path: `./test-results/screenshots/${screenshotName}_${Date.now()}.png`,
    fullPage: true 
  });
});

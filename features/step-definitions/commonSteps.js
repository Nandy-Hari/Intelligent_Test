const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { PageObjectManager } = require('../support/pageObjectManager');

let pageObjectManager;

// Initialize Page Object Manager
Given('I am on the {string} page', async function (pageName) {
  throw new Error(`Page ${pageName} is not supported`);
});

// Navigation steps
Given('I navigate to {string}', async function (url) {
  await this.page.goto(url);
  await this.page.waitForLoadState('networkidle');
});

Given('I go to {string}', async function (url) {
  await this.page.goto(url);
  await this.page.waitForLoadState('networkidle');
});

// Click actions
async function selfHealClick(page, elementText) {
  const selectors = [
    `text=${elementText}`,
    `[aria-label="${elementText}"]`,
    `[placeholder*="${elementText}"]`,
    `[id*="${elementText}"]`,
    `[class*="${elementText}"]`,
    `xpath=//*[contains(text(),"${elementText}")]`
  ];
  for (const selector of selectors) {
    try {
      await page.click(selector, { timeout: 3000 });
      console.log(`Self-heal: Clicked using selector: ${selector}`);
      return;
    } catch {}
  }
  throw new Error(`Could not find element: ${elementText}`);
}

When('I click on {string}', async function (elementText) {
  await selfHealClick(this.page, elementText);
});

When('I click the {string} button', async function (buttonText) {
  await selfHealClick(this.page, buttonText);
});

When('I click the {string} link', async function (linkText) {
  await this.page.click(`a:has-text("${linkText}")`);
});

// Input actions
async function selfHealFill(page, fieldName, value) {
  const selectors = [
    `input[name="${fieldName}"]`,
    `input[id*="${fieldName}"]`,
    `input[placeholder*="${fieldName}"]`,
    `textarea[name="${fieldName}"]`,
    `textarea[id*="${fieldName}"]`,
    `[aria-label*="${fieldName}"]`,
    `xpath=//input[contains(@placeholder,"${fieldName}")]`,
    `xpath=//input[contains(@name,"${fieldName}")]`,
    `xpath=//input[contains(@id,"${fieldName}")]`
  ];
  for (const selector of selectors) {
    try {
      await page.fill(selector, value, { timeout: 3000 });
      console.log(`Self-heal: Filled using selector: ${selector}`);
      return;
    } catch {}
  }
  throw new Error(`Could not find input field: ${fieldName}`);
}

When('I enter {string} in the {string} field', async function (text, fieldName) {
  await selfHealFill(this.page, fieldName, text);
});

When('I type {string}', async function (text) {
  await this.page.keyboard.type(text);
});

When('I press {string}', async function (key) {
  await this.page.keyboard.press(key);
});

// Search functionality
When('I search for {string}', async function (searchTerm) {
  if (this.currentPage && this.currentPage.searchFor) {
    await this.currentPage.searchFor(searchTerm);
  } else {
    // Generic search functionality
    const searchSelectors = [
      'input[type="search"]',
      'input[name="q"]',
      'input[name="search"]',
      'input[placeholder*="search"]',
      'input[placeholder*="Search"]',
      '[role="searchbox"]'
    ];
    
    let searched = false;
    for (const selector of searchSelectors) {
      try {
        await this.page.fill(selector, searchTerm, { timeout: 5000 });
        await this.page.press(selector, 'Enter');
        searched = true;
        break;
      } catch {
        continue;
      }
    }
    
    if (!searched) {
      throw new Error('Could not find search box');
    }
  }
});

// Wait actions
When('I wait for {int} seconds', async function (seconds) {
  await this.page.waitForTimeout(seconds * 1000);
});

When('I wait for {string} to be visible', async function (elementText) {
  await this.page.waitForSelector(`text=${elementText}`, { state: 'visible' });
});

When('I wait for page to load', async function () {
  await this.page.waitForLoadState('networkidle');
});

// Scroll actions
When('I scroll down', async function () {
  await this.page.keyboard.press('PageDown');
});

When('I scroll up', async function () {
  await this.page.keyboard.press('PageUp');
});

When('I scroll to {string}', async function (elementText) {
  const element = this.page.locator(`text=${elementText}`).first();
  await element.scrollIntoViewIfNeeded();
});

// Selection actions
async function selfHealSelect(page, dropdownName, optionText) {
  const selectors = [
    `select[name="${dropdownName}"]`,
    `select[id*="${dropdownName}"]`,
    `select:near(:text("${dropdownName}"))`,
    `[aria-label*="${dropdownName}"]`,
    `xpath=//select[contains(@name,"${dropdownName}")]`,
    `xpath=//select[contains(@id,"${dropdownName}")]`
  ];
  for (const selector of selectors) {
    try {
      await page.selectOption(selector, { label: optionText }, { timeout: 3000 });
      console.log(`Self-heal: Selected using selector: ${selector}`);
      return;
    } catch {}
  }
  throw new Error(`Could not find dropdown: ${dropdownName}`);
}

When('I select {string} from {string} dropdown', async function (optionText, dropdownName) {
  await selfHealSelect(this.page, dropdownName, optionText);
});

// File upload
When('I upload file {string} to {string}', async function (filePath, fieldName) {
  const selectors = [
    `input[type="file"][name="${fieldName}"]`,
    `input[type="file"][id="${fieldName}"]`,
    `input[type="file"]:near(:text("${fieldName}"))`
  ];
  
  let uploaded = false;
  for (const selector of selectors) {
    try {
      await this.page.setInputFiles(selector, filePath, { timeout: 5000 });
      uploaded = true;
      break;
    } catch {
      continue;
    }
  }
  
  if (!uploaded) {
    throw new Error(`Could not find file upload field: ${fieldName}`);
  }
});

// Double click action
async function selfHealDoubleClick(page, elementText) {
  const selectors = [
    `text=${elementText}`,
    `[aria-label="${elementText}"]`,
    `[placeholder*="${elementText}"]`,
    `[id*="${elementText}"]`,
    `[class*="${elementText}"]`,
    `xpath=//*[contains(text(),"${elementText}")]`
  ];
  for (const selector of selectors) {
    try {
      await page.dblclick(selector, { timeout: 3000 });
      console.log(`Self-heal: Double clicked using selector: ${selector}`);
      return;
    } catch {}
  }
  throw new Error(`Could not double click element: ${elementText}`);
}

When('I double click on {string}', async function (elementText) {
  await selfHealDoubleClick(this.page, elementText);
});

// Right click action
async function selfHealRightClick(page, elementText) {
  const selectors = [
    `text=${elementText}`,
    `[aria-label="${elementText}"]`,
    `[placeholder*="${elementText}"]`,
    `[id*="${elementText}"]`,
    `[class*="${elementText}"]`,
    `xpath=//*[contains(text(),"${elementText}")]`
  ];
  for (const selector of selectors) {
    try {
      await page.click(selector, { button: 'right', timeout: 3000 });
      console.log(`Self-heal: Right clicked using selector: ${selector}`);
      return;
    } catch {}
  }
  throw new Error(`Could not right click element: ${elementText}`);
}

When('I right click on {string}', async function (elementText) {
  await selfHealRightClick(this.page, elementText);
});

// Hover action
async function selfHealHover(page, elementText) {
  const selectors = [
    `text=${elementText}`,
    `[aria-label="${elementText}"]`,
    `[placeholder*="${elementText}"]`,
    `[id*="${elementText}"]`,
    `[class*="${elementText}"]`,
    `xpath=//*[contains(text(),"${elementText}")]`
  ];
  for (const selector of selectors) {
    try {
      await page.hover(selector, { timeout: 3000 });
      console.log(`Self-heal: Hovered using selector: ${selector}`);
      return;
    } catch {}
  }
  throw new Error(`Could not hover element: ${elementText}`);
}

When('I hover on {string}', async function (elementText) {
  await selfHealHover(this.page, elementText);
});

// Drag and drop action
async function selfHealDragAndDrop(page, sourceText, targetText) {
  const sourceSelectors = [
    `text=${sourceText}`,
    `[aria-label="${sourceText}"]`,
    `[id*="${sourceText}"]`,
    `[class*="${sourceText}"]`,
    `xpath=//*[contains(text(),"${sourceText}")]`
  ];
  const targetSelectors = [
    `text=${targetText}`,
    `[aria-label="${targetText}"]`,
    `[id*="${targetText}"]`,
    `[class*="${targetText}"]`,
    `xpath=//*[contains(text(),"${targetText}")]`
  ];
  for (const sourceSelector of sourceSelectors) {
    for (const targetSelector of targetSelectors) {
      try {
        await page.dragAndDrop(sourceSelector, targetSelector);
        console.log(`Self-heal: Dragged from ${sourceSelector} to ${targetSelector}`);
        return;
      } catch {}
    }
  }
  throw new Error(`Could not drag and drop from ${sourceText} to ${targetText}`);
}

When('I drag {string} and drop on {string}', async function (sourceText, targetText) {
  await selfHealDragAndDrop(this.page, sourceText, targetText);
});

// Note: SauceDemo custom actions were moved to sauceDemoSteps.js to avoid ambiguous step definitions

Then('I should see "{string}" in the cart badge', async function (count) {
  const badge = this.page.locator('.shopping_cart_badge');
  await expect(badge).toHaveText(count);
});

module.exports = { pageObjectManager };

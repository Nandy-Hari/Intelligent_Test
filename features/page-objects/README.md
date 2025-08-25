# Page Objects

This directory contains page objects for the test automation framework. Page objects encapsulate the behavior and elements of specific web pages, making tests more maintainable and readable.

## Structure

Each website has its own set of page objects, organized by functionality:

### SauceDemo

- `SauceDemoPage.js` - Main page object that combines all SauceDemo pages
- `SauceDemoLoginPage.js` - Login functionality
- `SauceDemoProductsPage.js` - Product listing and filtering
- `SauceDemoCartPage.js` - Shopping cart functionality
- `SauceDemoCheckoutPage.js` - Checkout process

## Design Pattern

All page objects follow the Page Object Model pattern:

1. **Extend BasePage**: All page objects inherit from BasePage
2. **Encapsulate Selectors**: Store selectors as properties
3. **Provide Methods**: Methods for interacting with the page
4. **Hide Complexity**: Abstract complex interactions

## Using Page Objects

Page objects can be accessed via the PageObjectManager:

```javascript
// Get a specific page
const loginPage = await this.pageObjectManager.getPage('saucedemo login');
await loginPage.login('standard_user', 'secret_sauce');

// Get the main page that combines all functionality
const sauceDemoPage = await this.pageObjectManager.getPage('saucedemo');
await sauceDemoPage.addProductToCart('Sauce Labs Backpack');
```

## Adding New Page Objects

To add a new page object:

1. Create a new file in this directory
2. Extend the BasePage class
3. Implement needed selectors and methods
4. Update PageObjectManager to support the new page object

## Self-Healing Capabilities

Page objects are designed with multiple selector strategies for self-healing:

- Primary selectors use data-test attributes when available
- Backup selectors use text content, ARIA labels, or other attributes
- Complex interactions are encapsulated in methods that can try alternative approaches

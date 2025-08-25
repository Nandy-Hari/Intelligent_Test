/**
 * Base Page - Common functionality for all pages
 */
class BasePage {
  constructor(page) {
    this.page = page;
  }

  async navigateTo(url) {
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  async clickElement(selector) {
    await this.page.waitForSelector(selector, { state: 'visible' });
    await this.page.click(selector);
  }

  async fillText(selector, text) {
    await this.page.waitForSelector(selector, { state: 'visible' });
    await this.page.fill(selector, text);
  }

  async getText(selector) {
    await this.page.waitForSelector(selector, { state: 'visible' });
    return await this.page.textContent(selector);
  }

  async isElementVisible(selector) {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async waitForElementToBeVisible(selector, timeoutMs = 5000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout: timeoutMs });
  }

  async waitForElementToBeHidden(selector, timeoutMs = 5000) {
    await this.page.waitForSelector(selector, { state: 'hidden', timeout: timeoutMs });
  }

  async selectOption(selector, option) {
    await this.page.waitForSelector(selector, { state: 'visible' });
    await this.page.selectOption(selector, option);
  }

  async checkElementExists(selector) {
    return await this.page.$(selector) !== null;
  }

  async getAttributeValue(selector, attribute) {
    await this.page.waitForSelector(selector, { state: 'visible' });
    return await this.page.getAttribute(selector, attribute);
  }

  async switchToNewTab() {
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
    ]);
    return newPage;
  }

  async closeCurrentTab() {
    await this.page.close();
  }

  async executeJavaScript(script) {
    return await this.page.evaluate(script);
  }

  async setViewportSize(width, height) {
    await this.page.setViewportSize({ width, height });
  }

  async reloadPage() {
    await this.page.reload();
  }

  async goBack() {
    await this.page.goBack();
  }

  async goForward() {
    await this.page.goForward();
  }
}

module.exports = { BasePage };

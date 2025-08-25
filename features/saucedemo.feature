Feature: SauceDemo E-commerce Site
  As a user
  I want to shop on SauceDemo
  So that I can verify login, cart, and checkout functionalities

  @login
  Scenario: Successful login with valid credentials
    Given I navigate to "https://www.saucedemo.com/"
    When I enter "standard_user" in the "Username" field
    And I enter "secret_sauce" in the "Password" field
    And I click on "Login"
    Then I should see "Products"

  @login
  Scenario: Unsuccessful login with invalid credentials
    Given I navigate to "https://www.saucedemo.com/"
    When I enter "locked_out_user" in the "Username" field
    And I enter "wrong_password" in the "Password" field
    And I click on "Login"
    Then I should see "Epic sadface"

  @addToCart
  Scenario: Add a product to the cart
    Given I navigate to "https://www.saucedemo.com/"
    When I enter "standard_user" in the "Username" field
    And I enter "secret_sauce" in the "Password" field
    And I click on "Login"
    And I click on "Add to cart" for "Sauce Labs Backpack"
    Then I should see "1" in the cart badge

  @checkout
  Scenario: Complete a checkout process
    Given I navigate to "https://www.saucedemo.com/"
    When I enter "standard_user" in the "Username" field
    And I enter "secret_sauce" in the "Password" field
    And I click on "Login"
    And I click on "Add to cart" for "Sauce Labs Backpack"
    And I click on the cart icon
    And I click on "Checkout"
    And I enter "John" in the "First Name" field
    And I enter "Doe" in the "Last Name" field
    And I enter "12345" in the "Postal Code" field
    And I click on "Continue"
    And I click on "Finish"
    Then I should see "Thank you for your order!"

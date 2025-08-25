Feature: Product Filtering
  As a shopper
  I want to filter products by price low to high
  So that I can find the most affordable items first

  Background:
    Given I navigate to "https://www.saucedemo.com/"
    When I enter "standard_user" in the "Username" field
    And I enter "secret_sauce" in the "Password" field
    And I click on "Login"
    Then I should see "Products"

  @sorting @products @regression
  Scenario: Sort products by price low to high
    When I select "Price (low to high)" from "product_sort_container" dropdown
    Then products should be sorted by price in ascending order

  @sorting @products @smoke
  Scenario: Verify lowest priced item appears first when sorted
    When I select "Price (low to high)" from "product_sort_container" dropdown
    Then the first product should be cheaper than the last product

  @sorting @products @regression
  Scenario: Verify sorting persists when navigating between pages
    When I select "Price (low to high)" from "product_sort_container" dropdown
    And I click on the first product
    And I click on "Back to products"
    Then products should be sorted by price in ascending order

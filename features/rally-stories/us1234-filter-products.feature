Feature: User can filter products by category
  As a user
  I want to filter products by category
  So that I can quickly find items I'm interested in

  @rally-story-US1234
  @rally-uuid-0123456789abcdef
  Scenario: Filter products by category using dropdown
    Given I navigate to "https://www.saucedemo.com/"
    When I enter "standard_user" in the "Username" field
    And I enter "secret_sauce" in the "Password" field
    And I click on "Login"
    And I select "Price (low to high)" from the product sort dropdown
    Then the products should be sorted by price in ascending order

  @rally-story-US1234
  @rally-uuid-0123456789abcdef
  Scenario: Filter products by price range
    Given I navigate to "https://www.saucedemo.com/"
    When I enter "standard_user" in the "Username" field
    And I enter "secret_sauce" in the "Password" field
    And I click on "Login"
    And I set the price range filter from "$0" to "$50"
    Then only products within the price range should be displayed

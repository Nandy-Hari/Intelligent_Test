Feature: Performance Testing with Intelligent_Automation
  As a tester
  I want to measure web application performance
  So that I can ensure optimal user experience

  @performance
  Scenario: Validate SauceDemo homepage performance
    Given I enable performance metrics collection
    When I navigate to "https://www.saucedemo.com/"
    And I collect performance metrics
    Then the page load time should be less than 3000 milliseconds
    And the first paint time should be less than 2000 milliseconds
    And the total resource count should be less than 30
    And the total resource size should be less than 500 kilobytes
    
  @performance
  Scenario: Validate SauceDemo login performance
    Given I enable performance metrics collection
    When I navigate to "https://www.saucedemo.com/"
    And I enter "standard_user" in the "Username" field
    And I enter "secret_sauce" in the "Password" field
    And I click on "Login"
    And I collect performance metrics
    Then the page load time should be less than 3000 milliseconds
    And the first paint time should be less than 1500 milliseconds
    And the largest contentful paint time should be less than 2500 milliseconds
    
  @performance
  Scenario: Validate SauceDemo product page performance
    Given I enable performance metrics collection
    When I navigate to "https://www.saucedemo.com/"
    And I enter "standard_user" in the "Username" field
    And I enter "secret_sauce" in the "Password" field
    And I click on "Login"
    And I wait for 2 seconds
    And I collect performance metrics
    Then the page load time should be less than 3000 milliseconds
    And the DOM content loaded time should be less than 1500 milliseconds
    And the cumulative layout shift should be less than 0.25

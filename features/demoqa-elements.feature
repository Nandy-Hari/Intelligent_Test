Feature: DemoQA Elements Page Testing
  As a user
  I want to interact with the elements on the DemoQA Elements page
  So that I can verify their functionality and UI behavior

  Background:
    Given I navigate to "https://demoqa.com/elements"

  @demoqa @elements @smokeDemoQA
  Scenario: Verify Elements page loads
    Then the page title should contain "DEMOQA"
    And I should see "Elements"
    And the URL should contain "elements"

  @demoqa @elements @textBoxTest
  Scenario: Fill and submit the Text Box form
    When I click on "Text Box"
    And I enter "John Doe" in the "Full Name" field
    # And I enter "john.doe@example.com" in the "Email" field
    And I enter "123 Main St" in the "Current Address" field
    And I enter "456 Secondary St" in the "Permanent Address" field
    When I click on "Submit"
    Then I should see "John Doe"
    And I should see "john.doe@example.com"
    And I should see "123 Main St"
    And I should see "456 Secondary St"

  @demoqa @elements @checkBox
  Scenario: Interact with Check Box
    When I click on "Check Box"
    And I click on "Expand all"
    And I click on "Home"
    Then I should see "You have selected :"
    And I should see "home"

  @demoqa @elements @radioButton
  Scenario: Select Radio Buttons
    When I click on "Radio Button"
    And I click on "Yes"
    Then I should see "You have selected Yes"
    When I click on "Impressive"
    Then I should see "You have selected Impressive"

  @demoqa @elements @webTables
  Scenario: Add a new record in Web Tables
    When I click on "Web Tables"
    And I click on "Add"
    And I enter "Alice" in the "First Name" field
    And I enter "Smith" in the "Last Name" field
    And I enter "alice.smith@example.com" in the "Email" field
    And I enter "30" in the "Age" field
    And I enter "50000" in the "Salary" field
    And I enter "QA" in the "Department" field
    When I click on "Submit"
    Then I should see "Alice"
    And I should see "Smith"
    And I should see "alice.smith@example.com"
    And I should see "QA"

  @demoqa @elements @buttons
  Scenario: Interact with Buttons
    When I click on "Buttons"
    And I double click on "Double Click Me"
    Then I should see "You have done a double click"
    When I right click on "Right Click Me"
    Then I should see "You have done a right click"
    When I click on "Click Me"
    Then I should see "You have done a dynamic click"

  @demoqa @elements @links
  Scenario: Verify Links
    When I click on "Links"
    And I click on "Home"
    Then the URL should be "https://demoqa.com/"
    When I go to "https://demoqa.com/elements"
    And I click on "Created"
    Then I should see "Link has responded with staus 201 and status text Created"
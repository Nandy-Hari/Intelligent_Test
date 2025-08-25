Feature: Implement user authentication system
  As a user
  I want to be able to log in securely
  So that I can access my personal account

  @jira-story-PROJ-456
  @jira-id-12345
  @priority-high
  @status-in-progress
  @component-authentication
  @security
  Scenario: Successful login with valid credentials
    Given I navigate to the login page
    When I enter valid username "testuser@example.com"
    And I enter valid password "SecurePass123!"
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see a welcome message

  @jira-story-PROJ-456
  @jira-id-12345
  @priority-high
  @status-in-progress
  @component-authentication
  @security
  Scenario: Failed login with invalid credentials
    Given I navigate to the login page
    When I enter invalid username "wronguser@example.com"
    And I enter invalid password "wrongpassword"
    And I click the login button
    Then I should see an error message "Invalid credentials"
    And I should remain on the login page

  @jira-story-PROJ-456
  @jira-id-12345
  @priority-high
  @status-in-progress
  @component-authentication
  @security
  Scenario: Account lockout after multiple failed attempts
    Given I navigate to the login page
    When I enter valid username "testuser@example.com"
    And I enter invalid password "wrongpassword" 3 times
    Then my account should be temporarily locked
    And I should see a message "Account locked due to multiple failed attempts"

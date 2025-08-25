Feature: Database Testing with Intelligent_Automation
  As a tester
  I want to test database operations
  So that I can ensure data integrity and verify backend operations

  @db
  Scenario: Connect to SQLite database and execute query
    Given I connect to "sqlite" database with:
      | filename | ./test-database.db |
    When I execute the query:
      """
      SELECT * FROM users WHERE active = 1
      """
    Then the query should return at least 1 rows
    
  @db
  Scenario: Execute parameterized query
    Given I connect to "sqlite" database with:
      | filename | ./test-database.db |
    When I execute the query:
      """
      SELECT * FROM users WHERE username = 'admin' AND active = 1
      """
    Then the query result should contain a row with:
      | username | admin  |
      | role     | admin  |
    
  @db
  Scenario: Test database update operation
    Given I connect to "sqlite" database with:
      | filename | ./test-database.db |
    When I begin a database transaction
    And I execute the update:
      """
      UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE username = 'admin'
      """
    Then the update should affect 1 rows
    When I commit the transaction
    
  @db
  Scenario: Verify record existence
    Given I connect to "sqlite" database with:
      | filename | ./test-database.db |
    Then a record should exist in table "users" with:
      | username | admin |
      | active   | 1     |
    
  @db
  Scenario: Store and use database values
    Given I connect to "sqlite" database with:
      | filename | ./test-database.db |
    When I execute the query:
      """
      SELECT user_id FROM users WHERE username = 'admin'
      """
    And I store query result field "user_id" at index 0 as "adminId"
    When I execute the query:
      """
      SELECT * FROM orders WHERE user_id = 1
      """
    Then the query should return at least 1 rows

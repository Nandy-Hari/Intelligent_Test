# API and Database Testing in Intelligent_Automation Framework

This guide explains how to use the API and database testing features in the Intelligent_Automation framework.

## API Testing

The Intelligent_Automation framework now includes robust API testing capabilities that allow you to:

- Test REST APIs with different HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Set various authentication types (Bearer token, Basic auth, API key)
- Validate responses using various assertion methods
- Perform JSON schema validation
- Store and reuse response values in subsequent tests
- Measure and assert on response times

### Sample API Test

```gherkin
Feature: API Testing Example

  @api
  Scenario: Test GET request to a public API
    Given I initialize API client with base URL "https://jsonplaceholder.typicode.com"
    When I send a GET request to "/posts/1"
    Then the response status code should be 200
    And the response should have a field "title" that contains "sunt aut"
    And the response time should be less than 2000 ms
```

### Available API Step Definitions

#### Setup Steps
- `I initialize API client with base URL "..."`
- `I set "bearer|basic|apikey" authentication with "..."`
- `I set request header "..." to "..."`

#### Request Steps
- `I send a GET request to "..."`
- `I send a GET request to "..." with parameters:`
- `I send a POST request to "..." with body:`
- `I send a PUT request to "..." with body:`
- `I send a DELETE request to "..."`
- `I send a PATCH request to "..." with body:`

#### Assertion Steps
- `the response status code should be ...`
- `the response should contain "..."`
- `the response should have a field "..." with value "..."`
- `the response should have a field "..." that contains "..."`
- `the response time should be less than ... ms`
- `the response should match schema:`
- `the response header "..." should be "..."`

#### Data Storage
- `I store the value of response field "..." as "..."`
- `I send a GET request to "..." with stored variable "..."`

## Database Testing

The Intelligent_Automation framework now includes comprehensive database testing capabilities that allow you to:

- Connect to multiple database types (MySQL, PostgreSQL, SQLite, MS SQL)
- Execute SQL queries and validate results
- Perform database operations within transactions
- Verify data before/after test execution
- Store and reuse query results in subsequent tests

### Supported Database Types

- MySQL
- PostgreSQL
- SQLite
- MS SQL Server

### Sample Database Test

```gherkin
Feature: Database Testing Example

  @db
  Scenario: Connect to SQLite database and execute query
    Given I connect to "sqlite" database with:
      | filename | ./test-database.db |
    When I execute the query:
      """
      SELECT * FROM users WHERE active = 1
      """
    Then the query should return at least 1 rows
```

### Available Database Step Definitions

#### Connection Steps
- `I connect to "mysql|postgres|sqlite|mssql" database with:`

#### Query Execution Steps
- `I execute the query:`
- `I execute the update:`
- `I begin a database transaction`
- `I commit the transaction`
- `I rollback the transaction`

#### Assertion Steps
- `the query should return ... rows`
- `the query should return at least ... rows`
- `the query result should contain a row with:`
- `the query result at index ... should have values:`
- `the update should affect ... rows`
- `a record should exist in table "..." with:`
- `no record should exist in table "..." with:`
- `the query execution time should be less than ... ms`

#### Data Storage
- `I store query result field "..." at index ... as "..."`

## Running Tests

To run API tests:
```bash
npm run test:api
```

To run database tests:
```bash
npm run test:db
```

## Required Dependencies

Make sure you have the required dependencies installed:

- For API testing: axios, ajv, lodash
- For database testing: mysql2, pg, sqlite, sqlite3, mssql

These dependencies have been added to your package.json and should be installed automatically when you run `npm install`.

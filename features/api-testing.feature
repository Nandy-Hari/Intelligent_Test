Feature: API Testing with Intelligent_Automation
  As a tester
  I want to test REST APIs
  So that I can ensure the backend services are working correctly

  @api
  Scenario: Test GET request to a public API
    Given I initialize API client with base URL "https://jsonplaceholder.typicode.com"
    When I send a GET request to "/posts/1"
    Then the response status code should be 200
    And the response should have a field "title" that contains "sunt aut"
    And the response time should be less than 2000 ms
    
  @api
  Scenario: Test POST request with JSON body
    Given I initialize API client with base URL "https://jsonplaceholder.typicode.com"
    When I send a POST request to "/posts" with body:
      """
      {
        "title": "Test Post",
        "body": "This is a test post created by Intelligent_Automation framework",
        "userId": 1
      }
      """
    Then the response status code should be 201
    And the response should have a field "id" with value "101"
    And the response should contain "Test Post"
    
  @api
  Scenario: Test authenticated API request
    Given I initialize API client with base URL "https://api.example.com"
    And I set "bearer" authentication with "my-auth-token"
    And I set request header "Content-Type" to "application/json"
    When I send a GET request to "/secured/resource"
    Then the response status code should be 200
    
  @api
  Scenario: Test API with parameters
    Given I initialize API client with base URL "https://jsonplaceholder.typicode.com"
    When I send a GET request to "/posts" with parameters:
      | parameter | value |
      | userId    | 1     |
      | _limit    | 5     |
    Then the response status code should be 200
    And the response should contain "userId"
    
  @api
  Scenario: Validate API response against JSON schema
    Given I initialize API client with base URL "https://jsonplaceholder.typicode.com"
    When I send a GET request to "/posts/1"
    Then the response status code should be 200
    And the response should match schema:
      """
      {
        "type": "object",
        "required": ["userId", "id", "title", "body"],
        "properties": {
          "userId": { "type": "integer" },
          "id": { "type": "integer" },
          "title": { "type": "string" },
          "body": { "type": "string" }
        }
      }
      """

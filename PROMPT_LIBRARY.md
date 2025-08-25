# Intelligent_Automation - Prompt Library

This document contains a comprehensive collection of GitHub Copilot prompts to help you extend and maintain the Intelligent_Automation framework.

## 🎯 Core Framework Prompts

### 1. Creating New Page Objects
```
Create a new page object for [website name] that extends BasePage. Include:
- Constructor with all important selectors
- Navigation method to the website
- Key interaction methods (search, click, fill)
- Verification methods for common elements
- Follow the same pattern as GooglePage.js
```

### 2. Adding New Step Definitions
```
Create step definitions for [specific functionality] that include:
- Given steps for page navigation
- When steps for user interactions
- Then steps for verifications
- Use the same pattern as existing step files
- Include error handling and multiple selector strategies
```

### 3. Creating Feature Files
```
Create a feature file for testing [website/functionality] with:
- Background section for common setup
- Multiple scenarios covering different user journeys
- Use of scenario outlines for data-driven testing
- Appropriate tags for organization
- Business-readable language without technical details
```

## 🔧 Enhancement Prompts

### 4. Database Integration
```
Add database step definitions to the framework that allow:
- Connecting to SQL databases
- Executing queries and storing results
- Verifying data before/after test execution
- Include connection pooling and error handling
- Support for multiple database types
```

### 5. API Testing Integration
```
Integrate API testing capabilities with:
- REST API step definitions
- Request/response validation
- Authentication handling (Bearer, API keys)
- JSON schema validation
- Integration with existing BDD scenarios
```

### 6. Mobile Testing Support
```
Extend the framework for mobile testing with:
- Playwright mobile browser contexts
- Touch gestures and mobile-specific interactions
- Responsive design testing
- Device-specific configurations
- Mobile page objects following the same patterns
```

### 7. Visual Testing
```
Add visual regression testing with:
- Full page and element screenshots
- Baseline image management
- Visual comparison assertions
- Configurable tolerance levels
- Integration with existing step definitions
```

## 📊 Reporting and Analytics Prompts

### 8. Advanced Reporting
```
Enhance the reporting system with:
- Test execution dashboards
- Historical trend analysis
- Performance metrics tracking
- Failed test analysis
- Email notifications for test results
```

### 9. Test Data Management
```
Create a test data management system that includes:
- External data file support (CSV, JSON, Excel)
- Data generation utilities
- Test data cleanup after execution
- Environment-specific data sets
- Data-driven testing enhancements
```

### 10. Performance Testing
```
Add performance testing capabilities with:
- Page load time measurements
- Network request monitoring
- Memory usage tracking
- Performance assertion steps
- Integration with existing scenarios
```

## 🛠️ Maintenance Prompts

### 11. Selector Management
```
Create a dynamic selector management system that:
- Automatically detects and updates broken selectors
- Provides fallback selector strategies
- Maintains a selector repository
- Includes selector health monitoring
- Supports CSS and XPath selectors
```

### 12. Test Stability
```
Improve test stability by:
- Adding smart wait strategies
- Implementing retry mechanisms
- Creating better error handling
- Adding network condition simulation
- Implementing flaky test detection
```

### 13. Parallel Execution
```
Optimize parallel execution with:
- Dynamic worker allocation
- Load balancing across scenarios
- Resource isolation between tests
- Shared state management
- Performance monitoring during parallel runs
```

## 🚀 CI/CD Integration Prompts

### 14. GitHub Actions Integration
```
Create GitHub Actions workflows that:
- Run tests on multiple browsers
- Generate and publish test reports
- Handle test artifacts (screenshots, videos)
- Support environment-specific testing
- Include failure notifications
```

### 15. Docker Support
```
Add Docker support with:
- Dockerfile for the framework
- Docker Compose for different environments
- Container-based test execution
- Volume management for test artifacts
- Multi-stage builds for optimization
```

### 16. Jenkins Pipeline
```
Create Jenkins pipeline that:
- Supports parameterized test execution
- Handles multiple environments
- Publishes test reports
- Manages test artifacts
- Includes post-build actions for notifications
```

## 🧪 Testing Prompts

### 17. Cross-Browser Testing
```
Enhance cross-browser support with:
- Browser-specific configurations
- Browser capability detection
- Cross-browser compatibility steps
- Browser-specific workarounds
- Parallel cross-browser execution
```

### 18. Accessibility Testing
```
Add accessibility testing with:
- WCAG compliance checks
- Screen reader compatibility
- Keyboard navigation testing
- Color contrast validation
- Accessibility-specific step definitions
```

### 19. Security Testing
```
Integrate security testing with:
- XSS vulnerability checks
- SQL injection testing
- Authentication bypass testing
- Security header validation
- HTTPS/SSL certificate verification
```

## 📱 Multi-Platform Prompts

### 20. Desktop Application Testing
```
Extend framework for desktop apps with:
- Electron app support
- Native desktop application testing
- Window management utilities
- Desktop-specific interactions
- File system operations
```

### 21. API-First Testing
```
Create API-first testing approach with:
- API contract testing
- Mock server integration
- API response validation
- Schema-driven testing
- API and UI test coordination
```

## 🔍 Debugging and Troubleshooting Prompts

### 22. Enhanced Debugging
```
Add debugging capabilities with:
- Step-by-step execution mode
- Variable inspection during test runs
- Breakpoint support in scenarios
- Interactive debugging console
- Test state visualization
```

### 23. Error Recovery
```
Implement error recovery mechanisms with:
- Automatic retry strategies
- Test state restoration
- Error categorization
- Recovery action suggestions
- Graceful degradation handling
```

### 24. Health Monitoring
```
Create framework health monitoring with:
- Test environment validation
- Dependency checking
- Performance baseline monitoring
- Resource usage tracking
- Proactive issue detection
```

## 📚 Documentation Prompts

### 25. Auto-Documentation
```
Create auto-documentation system that:
- Generates step definition documentation
- Creates usage examples from feature files
- Maintains API documentation
- Tracks framework changes
- Provides interactive guides
```

### 26. Training Materials
```
Create training materials including:
- Interactive tutorials for new users
- Best practices guide
- Common patterns library
- Troubleshooting guide
- Video demonstrations
```

## 🎨 UI Enhancement Prompts

### 27. Test Runner UI
```
Create a web-based test runner UI with:
- Visual test execution interface
- Real-time test progress monitoring
- Interactive test result exploration
- Test scheduling capabilities
- User management and permissions
```

### 28. Visual Test Builder
```
Build a visual test builder that:
- Allows drag-and-drop test creation
- Generates Gherkin scenarios automatically
- Provides element selector assistance
- Includes test preview functionality
- Supports test template creation
```

## 💡 Usage Tips for Prompts

1. **Be Specific**: Always mention the existing framework structure and patterns
2. **Include Context**: Reference existing files and their patterns
3. **Specify Integration**: Mention how new features should integrate with existing code
4. **Follow Conventions**: Ask Copilot to follow the established naming and structure conventions
5. **Include Testing**: Request test cases for new functionality
6. **Documentation**: Always ask for documentation updates

## 🔄 Iterative Development Prompts

### 29. Refactoring
```
Refactor [specific component] to improve:
- Code maintainability
- Performance
- Readability
- Test coverage
- Error handling
While maintaining backward compatibility and existing functionality
```

### 30. Feature Enhancement
```
Enhance [existing feature] by adding:
- [Specific new capability]
- Better error handling
- More comprehensive tests
- Improved documentation
- Performance optimizations
While following the existing framework patterns
```

---

## 🧠 AI Test Generator Prompts

### 1. Using the Test Generator
```
I want to create tests for a user story: "[your user story]". Can you help me use the test generator script?
```

### 2. Customizing Generation Output
```
I want to generate tests for this user story: "[your user story]" but I need to customize the output. How can I specify output directory, page objects, and other options?
```

### 3. Processing Multiple User Stories
```
I have several user stories in a file. How can I process all of them at once using the test generator?
```

### 4. Generating Tests Without API Key
```
I don't have an OpenAI API key but I need to generate tests from this user story: "[your user story]". Can you help me create the feature file manually?
```

### 5. Adding Custom Steps After Generation
```
The AI-generated tests for this user story don't have all the steps I need. How can I add custom step definitions to supplement the generated ones?
```

## 📝 How to Use These Prompts

1. **Copy the prompt** you need
2. **Customize** it with your specific requirements
3. **Provide context** about your current framework state
4. **Ask for specific deliverables** (code, tests, documentation)
5. **Request adherence** to existing patterns and conventions

These prompts will help you leverage GitHub Copilot effectively to extend and maintain your Intelligent_Automation Framework!

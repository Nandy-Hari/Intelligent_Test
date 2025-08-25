# AI Test Generation: User Guide

This guide explains how to use the AI-powered test generator to create test artifacts from user stories.

## Quick Start

1. **Set up your OpenAI API key**:
   - Copy the example env file:
     ```bash
     cp .env.example .env
     ```
   - Edit the `.env` file and add your OpenAI API key:
     ```
     OPENAI_API_KEY=your_api_key_here
     ```

2. **Install required dependencies**:
   ```bash
   npm install openai dotenv
   ```

3. **Generate tests from a user story**:
   ```bash
   npm run generate -- --story "As a user, I want to login to saucedemo with valid credentials so that I can access my account"
   ```

## Command Options

The test generator script supports various options:

| Option | Description |
|--------|-------------|
| `--story` | Process a single user story (string) |
| `--file` | Process multiple user stories from a file |
| `--output` | Output directory (default: features) |
| `--generate-all` | Generate all artifacts (features, step definitions, page objects) |
| `--dry-run` | Show what would be generated without writing files |
| `--help` | Show help |

## Examples

### Generate from a single user story
```bash
npm run generate -- --story "As a user, I want to login to saucedemo with valid credentials so that I can access my account"
```

### Generate all artifacts for a user story
```bash
npm run generate:all -- --story "As a user, I want to login to saucedemo with valid credentials so that I can access my account"
```

### Process multiple user stories from a file
```bash
npm run generate -- --file sample-stories.txt
```

### Preview what would be generated (dry run)
```bash
npm run generate -- --story "As a user..." --dry-run
```

### Specify a different output directory
```bash
npm run generate -- --story "As a user..." --output custom-features
```

## User Story Format

For best results, write user stories in the standard format:

```
As a [role], I want to [action] so that [benefit]
```

Examples:
- "As a user, I want to login to the application so that I can access my account"
- "As a customer, I want to filter products by price so that I can find affordable items"
- "As an admin, I want to manage user accounts so that I can maintain system security"

## Understanding Generated Files

The generator creates three types of files:

1. **Feature files** (.feature): Gherkin files with scenarios testing the user story
2. **Page objects** (.js): JavaScript classes for interacting with web pages
3. **Step definitions** (.js): JavaScript implementations of custom steps (when needed)

## Best Practices

1. **Review generated files**: Always review and adjust generated files as needed
2. **Start with dry run**: Use `--dry-run` to preview before generating
3. **Be specific**: Provide detailed user stories for better results
4. **Manage page objects**: Use `--generate-all` when testing new websites
5. **Use version control**: Commit generated files to track changes
6. **Iterate**: Start simple and add more complexity as needed

## Troubleshooting

- **API Key Issues**: Ensure your OpenAI API key is valid and has sufficient credits
- **Connectivity Problems**: Check your internet connection
- **Generation Quality**: Try rephrasing your user story for better results
- **File Conflicts**: Use dry run to preview and avoid overwriting important files
- **Missing Steps**: Use `--generate-all` to create custom step definitions

## Example User Story File

Create a text file with multiple user stories (one per line):

```
As a user, I want to login to saucedemo with valid credentials so that I can access my account
As a user, I want to add multiple items to my cart on saucedemo so that I can purchase them together
As a user, I want to filter products by price low to high so that I can see the cheapest products first
```

## Extending the Generator

The generator script (`scripts/generateTests.js`) can be customized to:

1. Change the OpenAI model used (adjust the `model` parameter)
2. Modify the prompt templates for different outputs
3. Add support for additional test artifacts
4. Customize the file naming conventions

See the script code for details on how to extend its functionality.

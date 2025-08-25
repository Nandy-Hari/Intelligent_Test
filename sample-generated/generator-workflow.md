# Test Generator Workflow

This document outlines the typical workflow for generating tests from user stories.

## Step 1: Identify User Stories

Begin by identifying the user stories you want to automate. A good user story follows this format:
```
As a [role], I want to [action] so that [benefit]
```

Example:
```
As a shopper, I want to filter products by price low to high so that I can find the most affordable items first
```

## Step 2: Generate Feature Files

Run the generator to create feature files from your user stories:

```bash
npm run generate -- --story "As a shopper, I want to filter products by price low to high so that I can find the most affordable items first"
```

This will:
1. Connect to OpenAI API
2. Generate a Gherkin feature file
3. Save it in your features directory

## Step 3: Review Generated Feature Files

Review the generated feature file to ensure it matches your requirements:
- Does it cover all aspects of the user story?
- Are the scenarios appropriate?
- Does it use existing step definitions where possible?

## Step 4: Generate Additional Artifacts (if needed)

If you need custom page objects or step definitions, use the --generate-all flag:

```bash
npm run generate:all -- --story "As a shopper, I want to filter products by price low to high so that I can find the most affordable items first"
```

This will:
1. Generate the feature file
2. Create or update page objects
3. Create custom step definitions if needed
4. Update PageObjectManager.js to include the new page objects

## Step 5: Execute the Generated Tests

Run the generated tests to verify they work as expected:

```bash
npm test -- features/product-filtering.feature
```

## Step 6: Refine and Iterate

If necessary, modify the generated files to:
- Add more detailed assertions
- Enhance page objects with additional functionality
- Improve step definitions for better reliability

## Complete Example

1. **Create a user story file**: `filter-story.txt`
   ```
   As a shopper, I want to filter products by price low to high so that I can find the most affordable items first
   ```

2. **Generate tests**:
   ```bash
   npm run generate:all -- --file filter-story.txt
   ```

3. **Review generated files**:
   - `features/product-filtering.feature`
   - `features/page-objects/SauceDemoProductsPage.js` (updated)
   - `features/step-definitions/product-filtering-steps.js`

4. **Run the tests**:
   ```bash
   npm test -- features/product-filtering.feature
   ```

5. **View the reports**:
   - Open `reports/cucumber-report.html` in a browser

## Best Practices

1. **Write clear user stories** - The quality of the generated tests depends on the clarity of your user stories
2. **Review before executing** - Always review generated files before running them
3. **Use dry run first** - Start with --dry-run to preview the generation
4. **Keep user stories in version control** - Track your user stories alongside your code
5. **Generate one story at a time** - Process complex user stories individually for better control

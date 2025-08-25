# Running the Test Generator - Command Examples

## Prerequisites

1. Install the dependencies:
   ```bash
   npm install openai dotenv
   ```

2. Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

## Example Commands

### 1. Generate a feature file from a user story

```bash
node scripts/generateTests.js --story "As a shopper, I want to filter products by price low to high so that I can find the most affordable items first"
```

### 2. Generate all artifacts (feature, page objects, step definitions)

```bash
node scripts/generateTests.js --story "As a shopper, I want to filter products by price low to high so that I can find the most affordable items first" --generate-all
```

### 3. Generate from a file with multiple user stories

```bash
node scripts/generateTests.js --file product-filter-story.txt
```

### 4. Generate with a custom output directory

```bash
node scripts/generateTests.js --story "As a shopper, I want to filter products by price low to high so that I can find the most affordable items first" --output custom-features
```

### 5. Preview generation without writing files (dry run)

```bash
node scripts/generateTests.js --story "As a shopper, I want to filter products by price low to high so that I can find the most affordable items first" --dry-run
```

### 6. Generate all artifacts from a file with a custom output

```bash
node scripts/generateTests.js --file product-filter-story.txt --generate-all --output custom-features
```

## Using NPM Scripts

Instead of typing the full node command, you can use the NPM scripts defined in package.json:

### 1. Generate a feature file

```bash
npm run generate -- --story "As a shopper, I want to filter products by price low to high so that I can find the most affordable items first"
```

### 2. Generate all artifacts

```bash
npm run generate:all -- --story "As a shopper, I want to filter products by price low to high so that I can find the most affordable items first"
```

### 3. Generate from a file

```bash
npm run generate -- --file product-filter-story.txt
```

Note: When using NPM scripts, you need the `--` before passing arguments to the script.

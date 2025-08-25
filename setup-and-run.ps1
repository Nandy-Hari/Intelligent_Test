# Playwright BDD Zero-Code Framework Setup and Run Script

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Playwright BDD Zero-Code Framework" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if dependencies are installed
if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Install Playwright browsers
Write-Host "Installing/updating Playwright browsers..." -ForegroundColor Yellow
npx playwright install

# Run the verification test
Write-Host ""
Write-Host "Running framework verification test..." -ForegroundColor Yellow
npx cucumber-js features/framework-verification.feature

Write-Host ""
Write-Host "Framework setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Available commands:" -ForegroundColor Cyan
Write-Host "  npm test                 - Run all tests" -ForegroundColor White
Write-Host "  npm run test:html        - Run tests with HTML report" -ForegroundColor White
Write-Host "  npm run test:parallel    - Run tests in parallel" -ForegroundColor White
Write-Host ""
Write-Host "To run specific features:" -ForegroundColor Cyan
Write-Host "  npx cucumber-js features/google-search.feature" -ForegroundColor White
Write-Host "  npx cucumber-js features/github-search.feature" -ForegroundColor White
Write-Host "  npx cucumber-js features/amazon-search.feature" -ForegroundColor White
Write-Host ""
Write-Host "To run tests with tags:" -ForegroundColor Cyan
Write-Host "  npx cucumber-js --tags '@smoke'" -ForegroundColor White
Write-Host "  npx cucumber-js --tags '@demo'" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to continue"

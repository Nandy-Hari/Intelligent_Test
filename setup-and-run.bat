@echo off
echo.
echo ========================================
echo  Playwright BDD Zero-Code Framework
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version: 
node --version

REM Check if dependencies are installed
if not exist node_modules (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Install Playwright browsers if not already installed
echo Installing/updating Playwright browsers...
npx playwright install

REM Run the verification test
echo.
echo Running framework verification test...
npx cucumber-js features/framework-verification.feature

echo.
echo Framework setup complete!
echo.
echo Available commands:
echo   npm test                 - Run all tests
echo   npm run test:html        - Run tests with HTML report
echo   npm run test:parallel    - Run tests in parallel
echo.
echo To run specific features:
echo   npx cucumber-js features/google-search.feature
echo   npx cucumber-js features/github-search.feature
echo   npx cucumber-js features/amazon-search.feature
echo.
echo To run tests with tags:
echo   npx cucumber-js --tags "@smoke"
echo   npx cucumber-js --tags "@demo"
echo.
pause

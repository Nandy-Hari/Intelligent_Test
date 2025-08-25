/**
 * Script to install and set up the advanced reporting dependencies
 */
const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

console.log('Setting up advanced reporting dependencies...');

// Install dependencies
try {
  console.log('Installing npm packages...');
  execSync('npm install --save nodemailer chart.js chartjs-node-canvas dayjs handlebars html-pdf-node', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

// Create directory structure
try {
  console.log('Creating directory structure...');
  
  const dirs = [
    'reports',
    'reports/dashboard',
    'reports/dashboard/charts',
    'reports/dashboard/assets',
    'reports/history'
  ];
  
  dirs.forEach(dir => {
    fs.ensureDirSync(path.join(__dirname, '../../../', dir));
  });
  
  console.log('✅ Directory structure created');
} catch (error) {
  console.error('❌ Error creating directories:', error.message);
}

console.log('Advanced reporting setup complete! 🎉');
console.log('\nTo generate reports, run:');
console.log('  npm run report:generate');
console.log('\nTo send email reports, configure your .env file with SMTP settings.');
console.log('See features/support/ADVANCED_REPORTING.md for more details.');

module.exports = {
  default: {
    require: [
      'features/step-definitions/*.js',
      'features/support/*.js'
    ],
    format: [
      'progress-bar',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    publishQuiet: true,
    parallel: 1,
    retry: 1,
    timeout: 60000
  }
};

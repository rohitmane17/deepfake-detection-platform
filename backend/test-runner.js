#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running NeuroX AI Backend Tests\n');

try {
  // Run smoke tests first
  console.log('📋 Running smoke tests...');
  execSync('npm test -- tests/smoke.test.js --verbose', { 
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('✅ Smoke tests passed!\n');

  // Run basic tests
  console.log('📋 Running basic tests...');
  execSync('npm test -- tests/basic.test.js --verbose', { 
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('✅ Basic tests passed!\n');

  // Run tests with coverage
  console.log('📋 Running tests with coverage...');
  execSync('npm test -- --coverage --coverageReporters=text --coverageReporters=html', { 
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('✅ All tests completed!\n');

  console.log('📊 Coverage report generated in coverage/ directory');
  console.log('🎉 Testing completed successfully!');

} catch (error) {
  console.error('❌ Tests failed:', error.message);
  process.exit(1);
}

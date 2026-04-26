# Testing Guide

## Overview

This document explains the testing setup for the NeuroX AI Backend API.

## Test Structure

```
backend/
├── tests/
│   ├── setup.js              # Test configuration and setup
│   ├── basic.test.js         # Basic functionality tests
│   ├── smoke.test.js         # Smoke tests for API health
│   ├── controllers/
│   │   └── auth.test.js     # Authentication controller tests
│   ├── integration/
│   │   └── api.test.js       # API integration tests
│   └── functional/
│       └── api.test.js       # Functional API tests
├── jest.config.js            # Jest configuration
├── test-runner.js            # Custom test runner
└── package.json              # Test scripts
```

## Running Tests

### Quick Tests
```bash
# Run basic functionality tests
npm run test:smoke

# Run basic unit tests
npm run test:basic

# Run all tests with coverage
npm run test:coverage
```

### Full Test Suite
```bash
# Run all tests sequentially
npm run test:all

# Run all Jest tests
npm test
```

### Individual Test Files
```bash
# Run specific test file
npm test -- tests/smoke.test.js

# Run tests matching pattern
npm test -- smoke
```

## Test Types

### 1. Smoke Tests (`tests/smoke.test.js`)
- Basic API functionality
- Health checks
- Request/response handling
- Error handling

### 2. Basic Tests (`tests/basic.test.js`)
- Simple unit tests
- Async operations
- Array/object operations

### 3. Controller Tests (`tests/controllers/`)
- Authentication logic
- Input validation
- Business logic testing

### 4. Integration Tests (`tests/integration/`)
- API endpoint testing
- Middleware integration
- Cross-component testing

### 5. Functional Tests (`tests/functional/`)
- End-to-end scenarios
- Real request handling
- Security headers

## Test Configuration

### Jest Setup (`jest.config.js`)
- Test environment: Node.js
- Coverage collection from controllers, middleware, models, routes
- Timeout: 10 seconds
- Setup file: `tests/setup.js`

### Test Setup (`tests/setup.js`)
- MongoDB Memory Server for database tests
- Test environment variables
- Database cleanup between tests

## Coverage Reports

Coverage reports are generated in the `coverage/` directory:

```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/lcov-report/index.html
```

## Writing New Tests

### Test Structure
```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should do something specific', async () => {
    // Test implementation
    expect(result).toBe(expected);
  });
});
```

### Best Practices
1. **Descriptive test names** - Explain what the test does
2. **Arrange, Act, Assert** - Structure tests clearly
3. **Mock external dependencies** - Use Jest mocks for databases, APIs
4. **Test edge cases** - Handle errors, empty data, invalid input
5. **Keep tests isolated** - Each test should run independently

### Example Test
```javascript
describe('User Registration', () => {
  it('should register a new user successfully', async () => {
    // Arrange
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    // Act
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    // Assert
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(userData.email);
  });
});
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: |
    cd backend
    npm install
    npm run test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v1
  with:
    file: ./backend/coverage/lcov.info
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Errors**
   - Ensure MongoDB Memory Server is installed
   - Check test environment variables

2. **Timeout Errors**
   - Increase timeout in jest.config.js
   - Check for async operations not properly awaited

3. **Module Import Errors**
   - Verify file paths in test imports
   - Check if modules are properly mocked

### Debugging Tests

```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Run specific test with verbose output
npm test -- tests/smoke.test.js --verbose
```

## Test Data Management

### Fixtures
Create test data fixtures in `tests/fixtures/`:
```
tests/fixtures/
├── users.json
├── images/
│   └── test-image.jpg
└── data.json
```

### Cleanup
Tests automatically clean up:
- Database collections are cleared between tests
- Temporary files are removed
- Mocks are reset after each test

## Performance Testing

For load testing, consider using tools like:
- Artillery
- K6
- JMeter

Example Artillery config:
```yaml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
```

## Security Testing

- Test input validation
- Verify authentication/authorization
- Check for XSS vulnerabilities
- Test rate limiting
- Validate CORS configuration

/**
 * Environment Variables Validator
 * Validates required environment variables on startup
 */

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'PORT'
];

const optionalEnvVars = [
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS',
  'EMAIL_FROM',
  'ADMIN_EMAIL',
  'UPLOAD_PATH',
  'MAX_FILE_SIZE'
];

const validateEnvironment = () => {
  const missing = [];
  const warnings = [];

  // Check required variables
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Check optional variables
  optionalEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  });

  // Log results
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\nPlease set these environment variables and restart the server.');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Missing optional environment variables (using defaults):');
    warnings.forEach(varName => {
      console.warn(`   - ${varName}`);
    });
  }

  // Validate specific values
  if (process.env.PORT && isNaN(parseInt(process.env.PORT))) {
    console.error('❌ PORT must be a valid number');
    process.exit(1);
  }

  if (process.env.EMAIL_PORT && isNaN(parseInt(process.env.EMAIL_PORT))) {
    console.error('❌ EMAIL_PORT must be a valid number');
    process.exit(1);
  }

  if (process.env.MAX_FILE_SIZE && isNaN(parseInt(process.env.MAX_FILE_SIZE))) {
    console.error('❌ MAX_FILE_SIZE must be a valid number');
    process.exit(1);
  }

  console.log('✅ Environment variables validated successfully');
  
  return {
    required: requiredEnvVars,
    optional: optionalEnvVars,
    missing,
    warnings
  };
};

module.exports = { validateEnvironment, requiredEnvVars, optionalEnvVars };

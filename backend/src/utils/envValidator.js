/**
 * Environment Variable Validator
 * Validates that all required environment variables are set
 */

/**
 * Validate environment variables on startup
 * @returns {Object} Validation result with missing and present variables
 */
const validateEnvironment = () => {
    console.log('🔧 Validating environment variables...');

    // Critical variables required for production
    const criticalVars = [
        'DATABASE_URL',
        'JWT_SECRET',
        'FRONTEND_URL',
        'GEMINI_API_KEYS'
    ];

    // Important variables for full functionality
    const importantVars = [
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'REDIS_HOST',
        'REDIS_PORT',
        'REDIS_PASSWORD'
    ];

    // Optional variables
    const optionalVars = [
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET',
        'RAZORPAY_KEY',
        'RAZORPAY_SECRET',
        'HUG_API_KEY'
    ];

    const missingCritical = [];
    const missingImportant = [];
    const missingOptional = [];
    const present = [];

    // Check critical variables
    criticalVars.forEach(varName => {
        if (!process.env[varName]) {
            missingCritical.push(varName);
            console.error(`❌ CRITICAL: Missing environment variable: ${varName}`);
        } else {
            present.push(varName);
            console.log(`✅ ${varName}: Set`);
        }
    });

    // Check important variables
    importantVars.forEach(varName => {
        if (!process.env[varName]) {
            missingImportant.push(varName);
            console.warn(`⚠️  IMPORTANT: Missing environment variable: ${varName}`);
        } else {
            present.push(varName);
            console.log(`✅ ${varName}: Set`);
        }
    });

    // Check optional variables
    optionalVars.forEach(varName => {
        if (!process.env[varName]) {
            missingOptional.push(varName);
            console.log(`ℹ️  OPTIONAL: Missing environment variable: ${varName}`);
        } else {
            present.push(varName);
            console.log(`✅ ${varName}: Set`);
        }
    });

    // Log summary
    console.log('\n📊 Environment Variable Summary:');
    console.log(`   Total Present: ${present.length}`);
    console.log(`   Missing Critical: ${missingCritical.length}`);
    console.log(`   Missing Important: ${missingImportant.length}`);
    console.log(`   Missing Optional: ${missingOptional.length}`);

    // Additional validation
    console.log('\n🔍 Additional Validation:');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set (defaulting to development)'}`);
    console.log(`   PORT_NO: ${process.env.PORT_NO || 'not set (defaulting to 5000)'}`);

    // Validate GEMINI_API_KEYS format
    if (process.env.GEMINI_API_KEYS) {
        const keys = process.env.GEMINI_API_KEYS.split(',').filter(k => k.trim());
        console.log(`   GEMINI_API_KEYS: ${keys.length} key(s) configured`);
    }

    // Validate FRONTEND_URL format
    if (process.env.FRONTEND_URL) {
        const isValidUrl = process.env.FRONTEND_URL.startsWith('http://') ||
            process.env.FRONTEND_URL.startsWith('https://');
        if (!isValidUrl) {
            console.warn(`⚠️  FRONTEND_URL should start with http:// or https://`);
        }
    }

    const result = {
        valid: missingCritical.length === 0,
        missingCritical,
        missingImportant,
        missingOptional,
        present,
        warnings: []
    };

    // Add warnings
    if (missingImportant.length > 0) {
        result.warnings.push(`${missingImportant.length} important variable(s) missing - some features may not work`);
    }

    // Exit if critical variables are missing in production
    if (missingCritical.length > 0 && process.env.NODE_ENV === 'production') {
        console.error('\n❌ FATAL: Critical environment variables are missing in production!');
        console.error('   Missing:', missingCritical.join(', '));
        console.error('   Please set these variables in your deployment platform (Render, Vercel, etc.)');
        process.exit(1);
    }

    if (missingCritical.length === 0) {
        console.log('\n✅ All critical environment variables are set!');
    }

    return result;
};

module.exports = { validateEnvironment };

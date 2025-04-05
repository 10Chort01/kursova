require('dotenv').config();

// Configuration object with environment variables
const config = {
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/photo_app'
    },
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dxh0ymchw',
        api_key: process.env.CLOUDINARY_API_KEY || '646742527642466',
        api_secret: process.env.CLOUDINARY_API_SECRET || 'nEdMC7JAc9iU_PEDzStv-C71S5A'
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key_here'
    },
    port: process.env.PORT || 5002
};

// Log configuration (without sensitive data)
console.log('Configuration loaded:', {
    mongodb: {
        uri: config.mongodb.uri,
        uriLength: config.mongodb.uri ? config.mongodb.uri.length : 0
    },
    cloudinary: {
        cloud_name: config.cloudinary.cloud_name ? 'present' : 'missing',
        api_key: config.cloudinary.api_key ? 'present' : 'missing',
        api_secret: config.cloudinary.api_secret ? 'present' : 'missing'
    },
    jwt: {
        secret: config.jwt.secret ? 'present' : 'missing',
        secretLength: config.jwt.secret ? config.jwt.secret.length : 0,
        refreshSecret: config.jwt.refreshSecret ? 'present' : 'missing'
    },
    port: config.port
});

module.exports = config; 
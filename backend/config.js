const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// Configuration object with hardcoded values
const config = {
    mongodb: {
        uri: 'mongodb://127.0.0.1:27017/photo_app'
    },
    cloudinary: {
        cloud_name: 'dxh0ymchw',
        api_key: '646742527642466',
        api_secret: 'nEdMC7JAc9iU_PEDzStv-C71S5A'
    },
    jwt: {
        secret: 'your_jwt_secret_key_here'
    },
    port: 5002
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
        secretLength: config.jwt.secret ? config.jwt.secret.length : 0
    },
    port: config.port
});

module.exports = config; 
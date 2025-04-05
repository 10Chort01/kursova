const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

const auth = async (req, res, next) => {
    try {
        console.log('=== Auth middleware ===');
        console.log('Request headers:', req.headers);
        
        const token = req.header('Authorization')?.replace('Bearer ', '');
        console.log('Token received:', token ? 'Present' : 'Missing');
        console.log('Token value:', token);

        if (!token) {
            throw new Error('No token provided');
        }

        const decoded = jwt.verify(token, config.jwt.secret);
        console.log('Decoded token:', decoded);

        const user = await User.findById(decoded.userId);
        console.log('User found:', user ? 'Yes' : 'No');
        console.log('User details:', user ? { id: user._id, username: user.username } : 'Not found');

        if (!user) {
            throw new Error('User not found');
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Please authenticate', error: error.message });
    }
};

module.exports = auth; 
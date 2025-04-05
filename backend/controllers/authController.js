const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');
const Photo = require('../models/Photo');

// Generate tokens
const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { userId },
        config.jwt.secret,
        { expiresIn: '15m' }  // Shorter expiration for access token
    );
    
    const refreshToken = jwt.sign(
        { userId },
        config.jwt.refreshSecret,
        { expiresIn: '7d' }  // Longer expiration for refresh token
    );
    
    return { accessToken, refreshToken };
};

// Реєстрація нового користувача
exports.register = async (req, res) => {
    try {
        console.log('Отримано запит на реєстрацію:', req.body);
        const { username, email, password } = req.body;

        // Перевірка чи користувач вже існує
        console.log('Перевірка існуючого користувача...');
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            console.log('Користувач вже існує');
            return res.status(400).json({ message: 'Користувач з таким email або іменем вже існує' });
        }

        // Створення нового користувача
        console.log('Створення нового користувача...');
        const user = new User({
            username,
            email,
            password
        });

        console.log('Збереження користувача...');
        await user.save();
        console.log('Користувач успішно збережений');

        // Створення токенів
        const { accessToken, refreshToken } = generateTokens(user._id);

        // Зберігаємо refresh token в базі даних
        user.refreshToken = refreshToken;
        await user.save();

        console.log('Відправка відповіді...');
        res.status(201).json({
            message: 'Користувача успішно створено',
            accessToken,
            refreshToken,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Помилка при реєстрації:', error);
        res.status(500).json({ 
            message: 'Помилка сервера', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Вхід користувача
exports.login = async (req, res) => {
    try {
        console.log('Отримано запит на вхід:', req.body);
        const { email, password } = req.body;

        // Пошук користувача
        console.log('Пошук користувача...');
        const user = await User.findOne({ email });
        if (!user) {
            console.log('Користувача не знайдено');
            return res.status(401).json({ message: 'Невірний email або пароль' });
        }

        // Перевірка паролю
        console.log('Перевірка паролю...');
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Невірний пароль');
            return res.status(401).json({ message: 'Невірний email або пароль' });
        }

        // Створення токенів
        const { accessToken, refreshToken } = generateTokens(user._id);

        // Зберігаємо refresh token в базі даних
        user.refreshToken = refreshToken;
        await user.save();

        console.log('Відправка відповіді...');
        res.json({
            message: 'Успішний вхід',
            accessToken,
            refreshToken,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Помилка при вході:', error);
        res.status(500).json({ 
            message: 'Помилка сервера', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Оновлення токену
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token відсутній' });
        }

        // Перевірка refresh token
        const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
        const user = await User.findOne({ 
            _id: decoded.userId,
            refreshToken: refreshToken
        });

        if (!user) {
            return res.status(401).json({ message: 'Недійсний refresh token' });
        }

        // Генеруємо нові токени
        const tokens = generateTokens(user._id);
        
        // Оновлюємо refresh token в базі даних
        user.refreshToken = tokens.refreshToken;
        await user.save();

        res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    } catch (error) {
        console.error('Помилка оновлення токену:', error);
        res.status(401).json({ message: 'Недійсний refresh token' });
    }
};

// Вихід користувача
exports.logout = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.refreshToken = null;
            await user.save();
        }
        res.json({ message: 'Успішний вихід' });
    } catch (error) {
        console.error('Помилка при виході:', error);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

exports.getUserPhotos = async (req, res) => {
    try {
        console.log('Getting photos for user:', req.params.id);
        
        const photos = await Photo.find({ user: req.params.id })
            .sort({ createdAt: -1 })
            .populate({
                path: 'user',
                select: 'username avatar bio'
            })
            .populate({
                path: 'ratings.user',
                select: 'username avatar'
            })
            .populate({
                path: 'comments.user',
                select: 'username avatar'
            });

        console.log('Raw photos from database:', photos);

        // Обчислюємо середній рейтинг для кожної фотографії
        const photosWithRating = photos.map(photo => {
            const photoObj = photo.toObject({ virtuals: true, getters: true });
            console.log('Photo before toObject:', photo);
            console.log('Photo after toObject:', photoObj);
            
            if (photo.ratings && photo.ratings.length > 0) {
                const sum = photo.ratings.reduce((acc, curr) => acc + curr.value, 0);
                photoObj.averageRating = Number((sum / photo.ratings.length).toFixed(1));
            } else {
                photoObj.averageRating = 0;
            }
            
            // Зберігаємо _id
            photoObj._id = photo._id;
            
            return photoObj;
        });

        console.log('Final photos with rating:', photosWithRating);
        res.json(photosWithRating);
    } catch (error) {
        console.error('Error fetching user photos:', error);
        res.status(500).json({ message: 'Помилка отримання фотографій', error: error.message });
    }
}; 
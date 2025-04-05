const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Реєстрація
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log('Отримано запит на реєстрацію:', { username, email, password: '***' });

        // Перевірка існуючого користувача
        console.log('Перевірка існуючого користувача...');
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Користувач з таким email вже існує' });
        }

        // Створення нового користувача
        console.log('Створення нового користувача...');
        const user = new User({
            username,
            email,
            password
        });

        // Збереження користувача
        console.log('Збереження користувача...');
        await user.save();
        console.log('Користувач успішно збережений');

        // Створення JWT токену
        console.log('Створення JWT токену...');
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Відправка відповіді
        console.log('Відправка відповіді...');
        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Помилка реєстрації:', error);
        res.status(500).json({ message: 'Помилка сервера при реєстрації' });
    }
});

// Вхід
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Отримано запит на вхід:', { email, password: '***' });

        // Пошук користувача
        console.log('Пошук користувача...');
        const user = await User.findOne({ email });
        if (!user) {
            console.log('Користувача не знайдено');
            return res.status(401).json({ message: 'Невірний email або пароль' });
        }

        // Перевірка пароля
        console.log('Перевірка пароля...');
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Невірний пароль');
            return res.status(401).json({ message: 'Невірний email або пароль' });
        }

        // Створення JWT токену
        console.log('Створення JWT токену...');
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Відправка відповіді
        console.log('Відправка відповіді...');
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Помилка входу:', error);
        res.status(500).json({ message: 'Помилка сервера при вході' });
    }
});

module.exports = router; 
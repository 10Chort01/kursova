const User = require('../models/User');
const jwt = require('jsonwebtoken');

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

        // Створення JWT токену
        console.log('Створення JWT токену...');
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Відправка відповіді...');
        res.status(201).json({
            message: 'Користувача успішно створено',
            token,
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

        // Створення JWT токену
        console.log('Створення JWT токену...');
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Відправка відповіді...');
        res.json({
            message: 'Успішний вхід',
            token,
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
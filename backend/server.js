const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const cloudinary = require('cloudinary').v2;
const http = require('http');
const WebSocket = require('ws');
const { exec } = require('child_process');

// Налаштування Cloudinary
cloudinary.config(config.cloudinary);

// Логування налаштувань Cloudinary
console.log('Cloudinary налаштування:', config.cloudinary);

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статичні файли
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Додаткове логування для відстеження запитів
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// WebSocket підключення
wss.on('connection', (ws) => {
    console.log('Нове WebSocket підключення');

    ws.on('message', (message) => {
        console.log('Отримано повідомлення:', message);
        
        // Відправляємо повідомлення всім клієнтам
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('Клієнт відключився');
    });
});

// Маршрути API
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Підключення до MongoDB
console.log('Connecting to MongoDB with URI:', config.mongodb.uri);
mongoose.connect(config.mongodb.uri)
    .then(() => {
        console.log('Підключено до MongoDB');
        console.log('MongoDB connection state:', mongoose.connection.readyState);
        
        // Тестування підключення
        const testDb = mongoose.connection.db;
        testDb.createCollection('test_collection')
            .then(() => {
                console.log('Тестова колекція створена');
                return testDb.collection('test_collection').drop();
            })
            .then(() => {
                console.log('Тестова колекція видалена');
            })
            .catch(err => {
                console.error('Помилка тестування бази даних:', err);
            });
    })
    .catch(err => {
        console.error('MongoDB не встановлено або не запущено:', err);
        console.error('Будь ласка, встановіть MongoDB та запустіть її перед запуском сервера');
        console.error('Інструкції: https://www.mongodb.com/docs/manual/installation/');
    });

// Обробка помилок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Щось пішло не так!', error: err.message });
});

// Запуск сервера
const PORT = config.port || 5002;
server.listen(PORT, () => {
    console.log(`Сервер запущено на порту ${PORT}`);
}); 
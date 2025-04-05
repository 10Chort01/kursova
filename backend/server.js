const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const http = require('http');
const WebSocket = require('ws');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const config = require('./config');
const { exec } = require('child_process');

// Налаштування Cloudinary
cloudinary.config(config.cloudinary);

// Логування налаштувань Cloudinary
console.log('Cloudinary налаштування:', config.cloudinary);

const app = express();
const server = http.createServer(app);

// Налаштування WebSocket
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Нове WebSocket з\'єднання');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Отримано повідомлення:', data);
            ws.send(JSON.stringify({ type: 'response', data: 'Отримано' }));
        } catch (error) {
            console.error('Помилка обробки повідомлення:', error);
        }
    });

    ws.on('close', () => {
        console.log('WebSocket з\'єднання закрито');
    });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Додаткове логування для відстеження запитів
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Маршрути API
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);

// Тестування бази даних
const testDatabase = async () => {
    try {
        // Створюємо тестову базу даних
        const testDb = mongoose.connection.useDb('test_db');
        console.log('Тестова база даних успішно створена');

        // Створюємо тестову колекцію
        const testCollection = testDb.collection('test_collection');
        await testCollection.insertOne({ test: 'data' });
        console.log('Тестова колекція створена');

        // Видаляємо тестову колекцію
        await testCollection.drop();
        console.log('Тестова колекція видалена');
    } catch (error) {
        console.error('Помилка тестування бази даних:', error);
        throw error;
    }
};

// Підключення до MongoDB
console.log('Connecting to MongoDB with URI:', config.mongodb.uri);
console.log('MongoDB connection options:', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Перевірка, чи запущена MongoDB
exec('mongod --version', (error, stdout, stderr) => {
    if (error) {
        console.error('MongoDB не встановлено або не запущено:', error.message);
        console.error('Будь ласка, встановіть MongoDB та запустіть її перед запуском сервера');
        console.error('Інструкції: https://www.mongodb.com/docs/manual/installation/');
        
        // Додаємо обробку помилки для випадку, коли MongoDB не встановлено
        app.use((req, res, next) => {
            if (req.path.startsWith('/api')) {
                return res.status(503).json({
                    message: 'Сервіс тимчасово недоступний. MongoDB не встановлено або не запущено.',
                    error: 'MongoDB not installed or not running'
                });
            }
            next();
        });
    } else {
        console.log('MongoDB встановлено:', stdout);
    }
});

// Додаємо обробку помилок для MongoDB
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.error('MongoDB disconnected');
});

mongoose.connect(config.mongodb.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Підключено до MongoDB');
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    // Тестуємо підключення
    return testDatabase();
})
.catch(err => {
    console.error('Помилка підключення до MongoDB:', err);
    console.error('MongoDB connection error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
    });
    
    // Додаємо обробку помилки для випадку, коли не вдалося підключитися до MongoDB
    app.use((req, res, next) => {
        if (req.path.startsWith('/api')) {
            return res.status(503).json({
                message: 'Сервіс тимчасово недоступний. Не вдалося підключитися до MongoDB.',
                error: 'MongoDB connection failed'
            });
        }
        next();
    });
    
    // Не завершуємо процес, щоб сервер продовжував працювати
    // process.exit(1);
});

// Запуск сервера
server.listen(config.port, () => {
    console.log(`Сервер запущено на порту ${config.port}`);
}); 
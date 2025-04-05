const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function initDatabase() {
    try {
        // Підключення до MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Підключено до MongoDB');

        // Створення тестової бази даних
        const db = mongoose.connection.db;
        
        // Перевірка чи існує база даних
        const collections = await db.listCollections().toArray();
        console.log('Існуючі колекції:', collections.map(c => c.name));

        // Створення тестової колекції
        await db.createCollection('test');
        console.log('Створено тестову колекцію');

        // Додавання тестового документа
        await db.collection('test').insertOne({
            message: 'База даних успішно створена!',
            timestamp: new Date()
        });
        console.log('Додано тестовий документ');

        // Видалення тестової колекції
        await db.collection('test').drop();
        console.log('Тестова колекція видалена');

        console.log('База даних успішно ініціалізована!');
        process.exit(0);
    } catch (error) {
        console.error('Помилка при ініціалізації бази даних:', error);
        process.exit(1);
    }
}

initDatabase(); 
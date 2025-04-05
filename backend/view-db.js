const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function viewDatabase() {
    try {
        // Підключення до MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Підключено до MongoDB');

        const db = mongoose.connection.db;
        
        // Отримання списку колекцій
        const collections = await db.listCollections().toArray();
        console.log('\n=== Список колекцій ===');
        console.log(collections.map(c => c.name).join('\n'));

        // Перегляд вмісту кожної колекції
        for (const collection of collections) {
            const name = collection.name;
            console.log(`\n=== Вміст колекції ${name} ===`);
            
            const documents = await db.collection(name).find().toArray();
            console.log(JSON.stringify(documents, null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error('Помилка при перегляді бази даних:', error);
        process.exit(1);
    }
}

viewDatabase(); 
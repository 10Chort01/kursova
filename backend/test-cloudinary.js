const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Налаштування Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Тестування підключення
async function testCloudinary() {
    try {
        // Спроба завантажити тестове зображення
        const result = await cloudinary.uploader.upload('https://cloudinary.com/images/old_logo.png', {
            folder: 'test'
        });
        console.log('Підключення до Cloudinary успішне!');
        console.log('URL завантаженого зображення:', result.secure_url);
    } catch (error) {
        console.error('Помилка підключення до Cloudinary:', error.message);
    }
}

testCloudinary(); 
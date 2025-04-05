const Photo = require('../models/Photo');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const config = require('../config');
const mongoose = require('mongoose');

// Налаштування Cloudinary
cloudinary.config(config.cloudinary);

// Логування налаштувань Cloudinary
console.log('Cloudinary налаштування в photoController:', config.cloudinary);

// Завантаження фотографії
exports.uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Файл не завантажено' });
        }

        if (!req.body.title) {
            return res.status(400).json({ message: 'Назва фотографії обов\'язкова' });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'photo-sharing-app',
            use_filename: true
        });

        fs.unlink(req.file.path, (err) => {
            if (err) console.error('Помилка видалення тимчасового файлу:', err);
        });

        const photo = new Photo({
            title: req.body.title,
            description: req.body.description || '',
            imageUrl: result.secure_url,
            user: req.user._id
        });

        await photo.save();
        res.status(201).json(photo);
    } catch (error) {
        console.error('Помилка завантаження фотографії:', error);
        
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Помилка видалення тимчасового файлу:', err);
            });
        }

        res.status(500).json({ 
            message: 'Помилка завантаження фотографії', 
            error: error.message
        });
    }
};

// Отримання всіх фотографій
exports.getAllPhotos = async (req, res) => {
    try {
        const { search, sort } = req.query;
        let query = {};

        // Пошук за назвою або описом
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Сортування
        let sortOption = { createdAt: -1 }; // За замовчуванням новіші спочатку
        if (sort === 'oldest') {
            sortOption = { createdAt: 1 }; // Старіші спочатку
        } else if (sort === 'rating') {
            // Спочатку отримуємо всі фотографії
            const photos = await Photo.find(query)
                .populate('user', 'username avatar')
                .populate('ratings.user', 'username')
                .populate('comments.user', 'username');

            // Обчислюємо середній рейтинг для кожної фотографії
            const photosWithRating = photos.map(photo => {
                const photoObj = photo.toObject();
                if (photo.ratings && photo.ratings.length > 0) {
                    const sum = photo.ratings.reduce((acc, curr) => acc + curr.value, 0);
                    photoObj.averageRating = sum / photo.ratings.length;
                } else {
                    photoObj.averageRating = 0;
                }
                return photoObj;
            });

            // Сортуємо за середнім рейтингом
            photosWithRating.sort((a, b) => b.averageRating - a.averageRating);
            return res.json(photosWithRating);
        }

        // Якщо сортування не за рейтингом, використовуємо стандартне сортування
        const photos = await Photo.find(query)
            .sort(sortOption)
            .populate('user', 'username avatar')
            .populate('ratings.user', 'username')
            .populate('comments.user', 'username');

        // Додаємо середній рейтинг до кожної фотографії
        const photosWithRating = photos.map(photo => {
            const photoObj = photo.toObject();
            if (photo.ratings && photo.ratings.length > 0) {
                const sum = photo.ratings.reduce((acc, curr) => acc + curr.value, 0);
                photoObj.averageRating = sum / photo.ratings.length;
            } else {
                photoObj.averageRating = 0;
            }
            return photoObj;
        });

        res.json(photosWithRating);
    } catch (error) {
        console.error('Помилка отримання фотографій:', error);
        res.status(500).json({ message: 'Помилка отримання фотографій', error: error.message });
    }
};

// Отримання фотографії за ID
exports.getPhotoById = async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.id)
            .populate('user', 'username avatar bio')
            .populate('ratings.user', 'username')
            .populate('comments.user', 'username avatar');

        if (!photo) {
            return res.status(404).json({ message: 'Фотографію не знайдено' });
        }

        const photoObj = photo.toObject();
        if (photo.ratings.length > 0) {
            const sum = photo.ratings.reduce((acc, curr) => acc + curr.value, 0);
            photoObj.averageRating = sum / photo.ratings.length;
        } else {
            photoObj.averageRating = 0;
        }

        res.json(photoObj);
    } catch (error) {
        res.status(500).json({ message: 'Помилка отримання фотографії', error: error.message });
    }
};

// Додавання рейтингу
exports.addRating = async (req, res) => {
    try {
        console.log('=== Starting addRating function ===');
        console.log('Request body:', req.body);
        console.log('Request params:', req.params);
        console.log('Request user:', req.user);
        console.log('Request headers:', req.headers);

        const { value } = req.body;
        console.log('Received rating:', value, 'type:', typeof value);
        
        // Перевірка валідності рейтингу
        const ratingValue = Number(value);
        console.log('Converted rating value:', ratingValue, 'type:', typeof ratingValue);
        console.log('isNaN check:', isNaN(ratingValue));
        console.log('Range check:', ratingValue < 1 || ratingValue > 5);

        if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
            console.log('Rating validation failed');
            return res.status(400).json({ message: 'Рейтинг повинен бути числом від 1 до 5' });
        }

        console.log('Looking for photo with ID:', req.params.id);
        const photo = await Photo.findById(req.params.id);
        
        if (!photo) {
            console.log('Photo not found');
            return res.status(404).json({ message: 'Фотографію не знайдено' });
        }

        console.log('Found photo:', photo._id);
        console.log('Current ratings:', JSON.stringify(photo.ratings, null, 2));

        // Перевірка чи користувач вже оцінював
        const existingRatingIndex = photo.ratings.findIndex(
            r => r.user.toString() === req.user._id.toString()
        );

        console.log('Existing rating index:', existingRatingIndex);
        console.log('User ID comparison:', {
            ratingUserId: photo.ratings[existingRatingIndex]?.user.toString(),
            currentUserId: req.user._id.toString()
        });

        if (existingRatingIndex !== -1) {
            // Оновлюємо існуючий рейтинг
            const oldValue = photo.ratings[existingRatingIndex].value;
            photo.ratings[existingRatingIndex].value = ratingValue;
            console.log(`Updating existing rating from ${oldValue} to ${ratingValue}`);
        } else {
            // Додаємо новий рейтинг
            photo.ratings.push({
                user: req.user._id,
                value: ratingValue
            });
            console.log('Adding new rating:', ratingValue);
        }

        // Зберігаємо зміни
        console.log('Saving photo...');
        await photo.save();
        console.log('Photo saved successfully');
        
        // Повертаємо оновлену фотографію з усіма даними
        console.log('Fetching updated photo data...');
        const updatedPhoto = await Photo.findById(req.params.id)
            .populate('user', 'username avatar bio')
            .populate('ratings.user', 'username')
            .populate('comments.user', 'username avatar');

        // Обчислюємо середній рейтинг
        const photoObj = updatedPhoto.toObject();
        if (updatedPhoto.ratings && updatedPhoto.ratings.length > 0) {
            const sum = updatedPhoto.ratings.reduce((acc, curr) => acc + Number(curr.value), 0);
            photoObj.averageRating = Number((sum / updatedPhoto.ratings.length).toFixed(1));
            console.log('Rating calculation:', {
                values: updatedPhoto.ratings.map(r => r.value),
                sum: sum,
                count: updatedPhoto.ratings.length,
                average: photoObj.averageRating
            });
        } else {
            photoObj.averageRating = 0;
            console.log('No ratings available');
        }

        console.log('Sending response...');
        res.json(photoObj);
        console.log('=== Finished addRating function ===');
    } catch (error) {
        console.error('=== Error in addRating function ===');
        console.error('Error details:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Stack trace:', error.stack);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Недійсні дані', error: error.message });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Недійсний ID фотографії', error: error.message });
        }
        res.status(500).json({ message: 'Помилка додавання рейтингу', error: error.message });
    }
};

// Додавання коментаря
exports.addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const photo = await Photo.findById(req.params.id);

        if (!photo) {
            return res.status(404).json({ message: 'Фотографію не знайдено' });
        }

        photo.comments.push({
            user: req.user._id,
            text
        });

        await photo.save();

        // Отримуємо оновлену фотографію з усіма даними
        const updatedPhoto = await Photo.findById(req.params.id)
            .populate('user', 'username avatar bio')
            .populate('ratings.user', 'username')
            .populate('comments.user', 'username avatar');

        res.json(updatedPhoto);
    } catch (error) {
        res.status(500).json({ message: 'Помилка додавання коментаря', error: error.message });
    }
};

// Видалення фотографії
exports.deletePhoto = async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.id);

        if (!photo) {
            return res.status(404).json({ message: 'Фотографію не знайдено' });
        }

        // Перевірка чи користувач є власником фотографії
        if (photo.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Немає прав для видалення цієї фотографії' });
        }

        // Видалення з Cloudinary
        const publicId = photo.imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);

        // Використовуємо deleteOne замість remove
        await Photo.deleteOne({ _id: photo._id });
        res.json({ message: 'Фотографію успішно видалено' });
    } catch (error) {
        console.error('Помилка видалення фотографії:', error);
        res.status(500).json({ message: 'Помилка видалення фотографії', error: error.message });
    }
};

// Редагування фотографії
exports.updatePhoto = async (req, res) => {
    try {
        const { title, description } = req.body;
        const photoId = req.params.id;

        // Знаходимо фото
        const photo = await Photo.findById(photoId);
        if (!photo) {
            return res.status(404).json({ message: 'Фотографію не знайдено' });
        }

        // Перевіряємо чи користувач є власником фото
        if (photo.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Немає прав для редагування цієї фотографії' });
        }

        // Оновлюємо дані
        photo.title = title || photo.title;
        photo.description = description || photo.description;

        await photo.save();

        res.json(photo);
    } catch (error) {
        console.error('Помилка редагування фотографії:', error);
        res.status(500).json({ message: 'Помилка редагування фотографії', error: error.message });
    }
}; 
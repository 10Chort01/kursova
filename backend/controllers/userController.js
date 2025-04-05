const User = require('../models/User');
const Photo = require('../models/Photo');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Оновлення профілю користувача
exports.updateProfile = async (req, res) => {
    try {
        console.log('=== Starting updateProfile function ===');
        console.log('Updating profile for user:', req.user._id);
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);
        console.log('Request headers:', req.headers);

        const { username, email, bio } = req.body;
        const updateData = { username, email, bio };

        // Якщо завантажено новий аватар
        if (req.file) {
            console.log('Uploading new avatar to Cloudinary');
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'photo-sharing-app/avatars',
                use_filename: true,
                unique_filename: true
            });
            console.log('Cloudinary upload result:', result);
            updateData.avatar = result.secure_url;

            // Видаляємо тимчасовий файл
            fs.unlinkSync(req.file.path);
        }

        console.log('Updating user with data:', updateData);
        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, select: '-password' }
        );

        console.log('Updated user:', user);
        console.log('=== Finished updateProfile function ===');
        res.json({ user });
    } catch (error) {
        console.error('=== Error in updateProfile function ===');
        console.error('Error details:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Stack trace:', error.stack);
        
        // Видаляємо тимчасовий файл у випадку помилки
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Помилка оновлення профілю', error: error.message });
    }
};

// Отримання фотографій користувача
exports.getUserPhotos = async (req, res) => {
    try {
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

        // Обчислюємо середній рейтинг для кожної фотографії
        const photosWithRating = photos.map(photo => {
            const photoObj = photo.toObject({ virtuals: true, getters: true });
            if (photo.ratings && photo.ratings.length > 0) {
                const sum = photo.ratings.reduce((acc, curr) => acc + curr.value, 0);
                photoObj.averageRating = Number((sum / photo.ratings.length).toFixed(1));
            } else {
                photoObj.averageRating = 0;
            }
            return photoObj;
        });

        res.json(photosWithRating);
    } catch (error) {
        console.error('Error fetching user photos:', error);
        res.status(500).json({ message: 'Помилка отримання фотографій', error: error.message });
    }
}; 
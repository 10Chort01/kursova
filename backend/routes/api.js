const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');
const photoController = require('../controllers/photoController');
const userController = require('../controllers/userController');

// Створення директорії для завантаження, якщо вона не існує
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Налаштування Multer для завантаження файлів
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Перевірка типу файлу
    if (!file.mimetype.match(/^image\/(jpeg|png|gif)$/)) {
        cb(new Error('Підтримуються тільки файли JPEG, PNG та GIF'), false);
        return;
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Обробка помилок Multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'Розмір файлу не повинен перевищувати 5MB' });
        }
        return res.status(400).json({ message: err.message });
    }
    if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
};

// Маршрути авторизації
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/refresh-token', authController.refreshToken);
router.post('/auth/logout', auth, authController.logout);

// Маршрути для фотографій
router.get('/photos', photoController.getAllPhotos);
router.get('/photos/:id', photoController.getPhotoById);
router.post('/photos', auth, upload.single('image'), handleMulterError, photoController.uploadPhoto);
router.put('/photos/:id', auth, photoController.updatePhoto);
router.post('/photos/:id/rate', auth, photoController.addRating);
router.post('/photos/:id/comment', auth, photoController.addComment);
router.delete('/photos/:id', auth, photoController.deletePhoto);

// Маршрути для користувачів
router.get('/users/:id/photos', userController.getUserPhotos);
router.put('/users/profile', auth, upload.single('avatar'), handleMulterError, userController.updateProfile);

module.exports = router; 
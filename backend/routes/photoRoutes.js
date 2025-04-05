const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Маршрути для фотографій
router.post('/', authMiddleware, upload.single('photo'), photoController.uploadPhoto);
router.get('/', photoController.getAllPhotos);
router.get('/:id', photoController.getPhotoById);
router.post('/:id/rate', authMiddleware, photoController.addRating);
router.post('/:id/comments', authMiddleware, photoController.addComment);
router.delete('/:id', authMiddleware, photoController.deletePhoto);

module.exports = router; 
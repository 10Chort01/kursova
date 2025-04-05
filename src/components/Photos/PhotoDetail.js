import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import { StarIcon } from '@heroicons/react/24/solid';

const PhotoDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [comment, setComment] = useState('');
    const [userRating, setUserRating] = useState(0);
    const [tempRating, setTempRating] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [isRatingChanged, setIsRatingChanged] = useState(false);

    useEffect(() => {
        fetchPhoto();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchPhoto = async () => {
        try {
            const response = await axiosInstance.get(`/photos/${id}`);
            setPhoto(response.data);
            
            // Встановлюємо рейтинг користувача, якщо він є
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user._id && response.data.ratings) {
                const userRatingObj = response.data.ratings.find(r => r.user && r.user._id === user._id);
                if (userRatingObj) {
                    setUserRating(userRatingObj.value);
                    setTempRating(userRatingObj.value);
                } else {
                    setUserRating(0);
                    setTempRating(0);
                }
            }
            
            setLoading(false);
        } catch (err) {
            console.error('Error fetching photo:', err);
            setError('Помилка завантаження фотографії');
            setLoading(false);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post(`/photos/${id}/comment`, { text: comment });
            setComment('');
            fetchPhoto();
        } catch (err) {
            setError('Помилка додавання коментаря');
        }
    };

    const handleRate = async (value) => {
        console.log('handleRate called with value:', value, 'type:', typeof value);
        
        if (!localStorage.getItem('token')) {
            setError('Будь ласка, увійдіть в систему');
            return;
        }
        
        // Перевірка валідності рейтингу
        const ratingValue = Number(value);
        console.log('Converted rating value:', ratingValue, 'type:', typeof ratingValue);
        console.log('isNaN check:', isNaN(ratingValue));
        console.log('Range check:', ratingValue < 1 || ratingValue > 5);
        
        if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
            setError('Рейтинг повинен бути числом від 1 до 5');
            return;
        }
        
        setTempRating(ratingValue);
        setIsRatingChanged(true);
    };

    const handleSaveRating = async () => {
        try {
            console.log('handleSaveRating called with tempRating:', tempRating, 'type:', typeof tempRating);
            
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('token');
            
            if (!user || !user._id) {
                setError('Будь ласка, увійдіть в систему');
                return;
            }
            
            if (!token) {
                setError('Токен авторизації відсутній');
                return;
            }

            // Перевірка валідності рейтингу
            const ratingValue = Number(tempRating);
            console.log('Converted rating value:', ratingValue, 'type:', typeof ratingValue);
            console.log('isNaN check:', isNaN(ratingValue));
            console.log('Range check:', ratingValue < 1 || ratingValue > 5);
            
            if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
                setError('Рейтинг повинен бути числом від 1 до 5');
                return;
            }

            console.log('Saving rating:', ratingValue, 'type:', typeof ratingValue);
            console.log('User:', user);
            console.log('Token:', token);

            await axiosInstance.post(`/photos/${id}/rate`, { value: ratingValue });
            setUserRating(ratingValue);
            setIsRatingChanged(false);
            fetchPhoto();
        } catch (err) {
            console.error('Error saving rating:', err);
            setError(err.response?.data?.message || 'Помилка збереження рейтингу');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Ви впевнені, що хочете видалити цю фотографію?')) {
            return;
        }

        try {
            await axiosInstance.delete(`/photos/${id}`);
            navigate('/');
        } catch (err) {
            console.error('Error deleting photo:', err);
            setError('Помилка видалення фотографії');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-600 text-center p-4">
                {error}
            </div>
        );
    }

    if (!photo) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Фотографію не знайдено</h2>
                <p className="mt-2 text-gray-600">Спробуйте повернутися на головну сторінку</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                    На головну
                </button>
            </div>
        );
    }

    const averageRating = photo.ratings && photo.ratings.length > 0
        ? (photo.ratings.reduce((acc, curr) => acc + curr.value, 0) / photo.ratings.length).toFixed(1)
        : 0;

    return (
        <div className="max-w-4xl mx-auto p-4">
            {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-96 object-cover"
                />
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-2">{photo.title}</h1>
                    <p className="text-gray-600 mb-4">{photo.description}</p>

                    <div className="flex items-center mb-4">
                        <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => handleRate(star)}
                                    className="focus:outline-none"
                                >
                                    <StarIcon
                                        className={`h-6 w-6 ${
                                            star <= tempRating
                                                ? 'text-yellow-400'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <span className="ml-2 text-gray-600">
                            {averageRating} ({photo.ratings?.length || 0} оцінок)
                        </span>
                        {isRatingChanged && (
                            <button
                                onClick={handleSaveRating}
                                className="ml-4 px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                Зберегти рейтинг
                            </button>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <h2 className="text-lg font-semibold mb-4">Коментарі</h2>
                        <form onSubmit={handleComment} className="mb-4">
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Додайте коментар..."
                                className="w-full p-2 border border-gray-300 rounded-md"
                                rows="3"
                            />
                            <button
                                type="submit"
                                className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                Додати коментар
                            </button>
                        </form>

                        <div className="space-y-4">
                            {photo.comments && photo.comments.map((comment) => (
                                <div key={comment._id} className="bg-gray-50 p-4 rounded-md">
                                    <div className="flex items-center mb-2">
                                        <img
                                            src={comment.user.avatar || '/default-avatar.png'}
                                            alt={comment.user.username}
                                            className="w-8 h-8 rounded-full mr-2"
                                        />
                                        <span className="font-medium">{comment.user.username}</span>
                                    </div>
                                    <p className="text-gray-700">{comment.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    Назад
                </button>
                {photo.user && photo.user._id === JSON.parse(localStorage.getItem('user'))?._id && (
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Видалити
                    </button>
                )}
            </div>
        </div>
    );
};

export default PhotoDetail; 
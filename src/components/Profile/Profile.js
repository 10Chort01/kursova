import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axios';
import { useNavigate } from 'react-router-dom';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editingPhoto, setEditingPhoto] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        bio: '',
        avatar: null
    });

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        console.log('User data from localStorage:', userData);
        
        if (!userData || !userData._id) {
            console.error('No user data found or invalid user data');
            navigate('/login');
            return;
        }
        console.log('User data loaded:', userData);
        setUser(userData);
        setFormData({
            username: userData.username,
            email: userData.email,
            bio: userData.bio || '',
            avatar: null
        });
    }, [navigate]);

    useEffect(() => {
        if (user && user._id) {
            console.log('Fetching photos for user:', user._id);
            fetchUserPhotos();
        }
    }, [user]);

    const fetchUserPhotos = async () => {
        try {
            console.log('Fetching photos for user:', user._id);
            const response = await axiosInstance.get(`/users/${user._id}/photos`);
            console.log('Photos loaded:', response.data);
            setPhotos(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching photos:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response ? {
                    status: err.response.status,
                    data: err.response.data
                } : 'No response'
            });
            setError(err.response?.data?.message || 'Помилка завантаження фотографій');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            
            // Додаємо всі поля форми
            formDataToSend.append('username', formData.username);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('bio', formData.bio);
            
            // Додаємо аватар тільки якщо він був змінений
            if (formData.avatar) {
                formDataToSend.append('avatar', formData.avatar);
            }

            console.log('Sending form data:', {
                username: formData.username,
                email: formData.email,
                bio: formData.bio,
                hasAvatar: !!formData.avatar
            });

            const response = await axiosInstance.put(
                '/users/profile',
                formDataToSend,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            console.log('Profile updated:', response.data);
            
            // Оновлюємо дані користувача в localStorage
            const updatedUser = response.data.user;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setEditMode(false);
            setError('');
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.message || 'Помилка оновлення профілю');
        }
    };

    const handleDeletePhoto = async (photoId) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цю фотографію?')) {
            return;
        }

        try {
            await axiosInstance.delete(`/photos/${photoId}`);
            setPhotos(photos.filter(photo => photo._id !== photoId));
        } catch (err) {
            console.error('Error deleting photo:', err);
            setError(err.response?.data?.message || 'Помилка видалення фотографії');
        }
    };

    const handleEditPhoto = (photo) => {
        console.log('Editing photo:', photo);
        console.log('Photo ID:', photo._id);
        console.log('Photo data type:', typeof photo._id);
        setEditingPhoto(photo);
    };

    const handleUpdatePhoto = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('title', editingPhoto.title);
            formData.append('description', editingPhoto.description);

            const response = await axiosInstance.put(`/photos/${editingPhoto._id}`, formData);
            setPhotos(photos.map(photo => 
                photo._id === editingPhoto._id ? response.data : photo
            ));
            setEditingPhoto(null);
        } catch (error) {
            console.error('Помилка оновлення фотографії:', error);
            if (error.response) {
                setError(error.response.data.message || 'Помилка оновлення фотографії');
            } else if (error.request) {
                setError('Не вдалося підключитися до сервера. Перевірте підключення до інтернету.');
            } else {
                setError('Помилка: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoChange = (e) => {
        const { name, value } = e.target;
        setEditingPhoto(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <div className="flex items-center">
                        {user.avatar && (
                            <div className="mr-4">
                                <img 
                                    src={user.avatar} 
                                    alt="Аватар користувача" 
                                    className="h-16 w-16 rounded-full object-cover"
                                />
                            </div>
                        )}
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Профіль користувача
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => setEditMode(!editMode)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        {editMode ? 'Закрити редагування' : 'Редагувати профіль'}
                    </button>
                </div>
                <div className="border-t border-gray-200">
                    <div className="px-4 py-5 sm:p-6">
                        {error && (
                            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}
                        
                        {editMode ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                        Ім'я користувача
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        id="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                                        Біографія
                                    </label>
                                    <textarea
                                        name="bio"
                                        id="bio"
                                        rows="3"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
                                        Аватар
                                    </label>
                                    <input
                                        type="file"
                                        name="avatar"
                                        id="avatar"
                                        onChange={handleChange}
                                        accept="image/*"
                                        className="mt-1 block w-full"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Зберегти зміни
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Ім'я користувача</h4>
                                    <p className="mt-1 text-sm text-gray-900">{user.username}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Email</h4>
                                    <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Біографія</h4>
                                    <p className="mt-1 text-sm text-gray-900">{user.bio || 'Не вказано'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Мої фотографії
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {photos.map(photo => (
                        <div key={photo._id} className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="relative pb-48">
                                <img
                                    src={photo.imageUrl}
                                    alt={photo.title}
                                    className="absolute h-full w-full object-cover"
                                />
                            </div>
                            <div className="p-4">
                                <h4 className="text-lg font-medium text-gray-900">{photo.title}</h4>
                                <p className="mt-1 text-sm text-gray-500">{photo.description}</p>
                                <div className="mt-4 flex justify-end space-x-2">
                                    <button
                                        onClick={() => handleEditPhoto(photo)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeletePhoto(photo._id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Модальне вікно для редагування фотографії */}
            {editingPhoto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <h3 className="text-xl font-semibold mb-4">Редагувати фотографію</h3>
                        <form onSubmit={handleUpdatePhoto}>
                            <div className="mb-4">
                                <label htmlFor="photo-title" className="block text-sm font-medium text-gray-700">
                                    Назва
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    id="photo-title"
                                    value={editingPhoto.title}
                                    onChange={handlePhotoChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="photo-description" className="block text-sm font-medium text-gray-700">
                                    Опис
                                </label>
                                <textarea
                                    name="description"
                                    id="photo-description"
                                    value={editingPhoto.description}
                                    onChange={handlePhotoChange}
                                    rows="3"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingPhoto(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                                >
                                    Скасувати
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
                                >
                                    {loading ? 'Збереження...' : 'Зберегти'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile; 
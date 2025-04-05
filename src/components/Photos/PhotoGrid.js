import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StarIcon, ChatBubbleLeftIcon, TagIcon } from '@heroicons/react/24/solid';
import API_URL from '../../config';
import axiosInstance from '../../utils/axios';
import { getTokens } from '../../utils/auth';

const PhotoGrid = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const navigate = useNavigate();

    useEffect(() => {
        fetchPhotos();
    }, [sortBy]);

    const fetchPhotos = async () => {
        try {
            setLoading(true);
            setError(null);
            
            let url = '/photos';
            const params = new URLSearchParams();
            
            if (searchTerm) {
                params.append('search', searchTerm);
            }
            
            if (sortBy) {
                params.append('sort', sortBy);
                console.log('Sorting photos by:', sortBy);
            }
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            
            console.log('Fetching photos with URL:', url);
            const response = await axiosInstance.get(url);
            console.log('Photos fetched:', response.data.length);
            setPhotos(response.data);
        } catch (error) {
            console.error('Помилка отримання фотографій:', error);
            if (error.response) {
                setError(error.response.data.message || 'Помилка отримання фотографій');
            } else if (error.request) {
                setError('Не вдалося підключитися до сервера. Перевірте підключення до інтернету.');
            } else {
                setError('Помилка: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchPhotos();
    };

    const handleSort = (e) => {
        setSortBy(e.target.value);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 p-4">
                {error}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <form onSubmit={handleSearch} className="flex gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Пошук фотографій..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="flex-1 p-2 border rounded"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Пошук
                    </button>
                </form>
                
                <select
                    value={sortBy}
                    onChange={handleSort}
                    className="p-2 border rounded"
                >
                    <option value="newest">Новіші спочатку</option>
                    <option value="oldest">Старіші спочатку</option>
                    <option value="rating">За рейтингом</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photos.map(photo => (
                    <div key={photo._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <img
                            src={photo.imageUrl}
                            alt={photo.title}
                            className="w-full h-64 object-cover"
                        />
                        <div className="p-4">
                            <h3 className="text-xl font-semibold mb-2">{photo.title}</h3>
                            <p className="text-gray-600 mb-4">{photo.description}</p>
                            
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <span className="text-yellow-500 mr-1">★</span>
                                        <span>{photo.averageRating ? photo.averageRating.toFixed(1) : 'Немає оцінок'}</span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {photo.createdAt ? new Date(photo.createdAt).toLocaleDateString() : 'Дата невідома'}
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Link
                                        to={`/photos/${photo.id || photo._id}`}
                                        className="text-blue-500 hover:text-blue-600"
                                        onClick={(e) => {
                                            const { accessToken } = getTokens();
                                            if (!accessToken) {
                                                e.preventDefault();
                                                if (window.confirm('Для перегляду деталей фотографії потрібно увійти. Бажаєте увійти?')) {
                                                    navigate('/login');
                                                }
                                            }
                                        }}
                                    >
                                        Детальніше
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PhotoGrid; 
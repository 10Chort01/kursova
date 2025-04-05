import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sort, setSort] = useState('newest');

    useEffect(() => {
        fetchPhotos();
    }, [sort]);

    const fetchPhotos = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/photos?sort=${sort}`);
            console.log('Photos from server:', response.data);
            setPhotos(response.data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Фотографії</h1>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setSort('newest')}
                        className={`px-4 py-2 rounded-md ${
                            sort === 'newest'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Новіші
                    </button>
                    <button
                        onClick={() => setSort('popular')}
                        className={`px-4 py-2 rounded-md ${
                            sort === 'popular'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Популярні
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center text-gray-600">Завантаження...</div>
            ) : error ? (
                <div className="text-center text-red-600">{error}</div>
            ) : photos.length === 0 ? (
                <div className="text-center text-gray-600">Немає доступних фотографій</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {photos.map((photo) => (
                        <div
                            key={photo._id}
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                        >
                            <Link to={`/photos/${photo._id}`}>
                                <img
                                    src={photo.imageUrl}
                                    alt={photo.title}
                                    className="w-full h-48 object-cover"
                                />
                            </Link>
                            <div className="p-4">
                                <Link to={`/photos/${photo._id}`}>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                        {photo.title}
                                    </h2>
                                    <p className="text-gray-600 mb-4">{photo.description}</p>
                                </Link>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <img
                                            src={photo.user.avatar || '/default-avatar.png'}
                                            alt={photo.user.username}
                                            className="w-8 h-8 rounded-full mr-2"
                                        />
                                        <span className="text-sm text-gray-600">
                                            {photo.user.username}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
 
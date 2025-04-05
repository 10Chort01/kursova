import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';

const UploadPhoto = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: null
    });
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file
            }));
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('image', formData.image);

            const response = await axiosInstance.post('/photos', formDataToSend);
            navigate(`/photos/${response.data._id}`);
        } catch (error) {
            console.error('Помилка завантаження фотографії:', error);
            if (error.response) {
                setError(error.response.data.message || 'Помилка завантаження фотографії');
            } else if (error.request) {
                setError('Не вдалося підключитися до сервера. Перевірте підключення до інтернету.');
            } else {
                setError('Помилка: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Завантажити нову фотографію</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Назва
                        </label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Опис
                        </label>
                        <textarea
                            name="description"
                            id="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                            Фотографія
                        </label>
                        <input
                            type="file"
                            name="image"
                            id="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            required
                            className="mt-1 block w-full"
                        />
                        {preview && (
                            <div className="mt-2">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="max-w-xs rounded-lg shadow-md"
                                />
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="text-red-500">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? 'Завантаження...' : 'Завантажити'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadPhoto; 
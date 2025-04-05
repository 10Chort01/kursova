import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';

const EditPhoto = () => {
    const [photo, setPhoto] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!id) {
            setError('ID фотографії не вказано');
            setLoading(false);
            return;
        }
        console.log('EditPhoto component mounted with ID:', id);
        fetchPhoto();
    }, [id]);

    const fetchPhoto = async () => {
        try {
            if (!id) {
                throw new Error('ID фотографії не вказано');
            }
            console.log('Fetching photo with ID:', id);
            const response = await axiosInstance.get(`/photos/${id}`);
            console.log('Photo data received:', response.data);
            console.log('Photo ID in response:', response.data.id || response.data._id);
            setPhoto(response.data);
            setTitle(response.data.title);
            setDescription(response.data.description || '');
            setLoading(false);
        } catch (err) {
            console.error('Error fetching photo:', err);
            setError(err.response?.data?.message || 'Помилка завантаження фотографії');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!id) {
                throw new Error('ID фотографії не вказано');
            }
            console.log('Updating photo with ID:', id);
            const response = await axiosInstance.put(`/photos/${id}`, {
                title,
                description
            });
            console.log('Update response:', response.data);
            console.log('Navigating back to photo detail with ID:', id);
            navigate(`/photos/${id}`);
        } catch (err) {
            console.error('Error updating photo:', err);
            setError(err.response?.data?.message || 'Помилка оновлення фотографії');
        }
    };

    if (loading) return <div className="text-center mt-8">Завантаження...</div>;
    if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;
    if (!photo) return <div className="text-center mt-8">Фотографію не знайдено</div>;

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Редагувати фотографію</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Назва
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Опис
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="3"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Скасувати
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        Зберегти
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditPhoto; 
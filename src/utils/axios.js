import axios from 'axios';
import API_URL from '../config';

const instance = axios.create({
    baseURL: API_URL,
    timeout: 10000 // 10 seconds timeout
});

// Додаємо інтерсептор для додавання токена авторизації до кожного запиту
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token ? 'Present' : 'Missing');
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Authorization header set:', config.headers.Authorization);
        } else {
            console.log('No token found in localStorage');
        }
        
        console.log('Request config:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            data: config.data
        });
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Додаємо інтерсептор для відстеження відповідей
instance.interceptors.response.use(
    (response) => {
        console.log('Response:', {
            status: response.status,
            statusText: response.statusText,
            data: response.data
        });
        return response;
    },
    (error) => {
        if (error.response) {
            // Сервер відповів з кодом помилки
            console.error('Response error:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            });
            
            // Якщо помилка 401, видаляємо токен і перенаправляємо на сторінку входу
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        } else if (error.request) {
            // Запит був зроблений, але відповіді не отримано
            console.error('Request error (no response):', error.request);
        } else {
            // Щось сталося при налаштуванні запиту
            console.error('Error setting up request:', error.message);
        }
        return Promise.reject(error);
    }
);

export default instance; 
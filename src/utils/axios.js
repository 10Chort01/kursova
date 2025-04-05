import axios from 'axios';
import API_URL from '../config';

// Функція для безпечного збереження токенів
const setTokens = (accessToken, refreshToken) => {
    try {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    } catch (error) {
        console.error('Error storing tokens:', error);
    }
};

// Функція для отримання токенів
const getTokens = () => {
    try {
        return {
            accessToken: localStorage.getItem('accessToken'),
            refreshToken: localStorage.getItem('refreshToken')
        };
    } catch (error) {
        console.error('Error retrieving tokens:', error);
        return { accessToken: null, refreshToken: null };
    }
};

// Функція для видалення токенів
const removeTokens = () => {
    try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    } catch (error) {
        console.error('Error removing tokens:', error);
    }
};

const instance = axios.create({
    baseURL: API_URL,
    timeout: 10000 // 10 seconds timeout
});

// Додаємо інтерсептор для додавання токена авторизації до кожного запиту
instance.interceptors.request.use(
    (config) => {
        const { accessToken } = getTokens();
        
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
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

// Додаємо інтерсептор для відстеження відповідей та оновлення токену
instance.interceptors.response.use(
    (response) => {
        console.log('Response:', {
            status: response.status,
            statusText: response.statusText,
            data: response.data
        });
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Якщо помилка 401 і це не спроба оновлення токену
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const { refreshToken } = getTokens();
                
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Спроба оновити токен
                const response = await axios.post(`${API_URL}/auth/refresh-token`, {
                    refreshToken
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data;
                setTokens(accessToken, newRefreshToken);

                // Повторюємо оригінальний запит з новим токеном
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return instance(originalRequest);
            } catch (refreshError) {
                // Якщо не вдалося оновити токен, виходимо
                removeTokens();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

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

export const auth = {
    setTokens,
    getTokens,
    removeTokens
};

export default instance; 
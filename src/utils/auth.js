// Функції для роботи з токенами авторизації

// Збереження токенів
export const setTokens = (tokens) => {
    if (tokens.accessToken) {
        localStorage.setItem('accessToken', tokens.accessToken);
    }
    if (tokens.refreshToken) {
        localStorage.setItem('refreshToken', tokens.refreshToken);
    }
};

// Отримання токенів
export const getTokens = () => {
    return {
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken')
    };
};

// Видалення токенів
export const removeTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

// Перевірка чи користувач авторизований
export const isAuthenticated = () => {
    const { accessToken } = getTokens();
    return !!accessToken;
};

// Отримання поточного користувача
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            console.error('Error parsing user from localStorage:', e);
            return null;
        }
    }
    return null;
}; 
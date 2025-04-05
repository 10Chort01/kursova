import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import PhotoGrid from './components/Photos/PhotoGrid';
import PhotoDetail from './components/Photos/PhotoDetail';
import UploadPhoto from './components/Photos/UploadPhoto';
import Profile from './components/Profile/Profile';

// Компонент для захисту маршрутів
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" replace />;
};

// Компонент навігації
const Navigation = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-xl font-bold text-indigo-600">
                                Фото Галерея
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                to="/"
                                className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                Головна
                            </Link>
                            {token && (
                                <>
                                    <Link
                                        to="/upload"
                                        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                    >
                                        Завантажити
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                    >
                                        Профіль
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center">
                        {token ? (
                            <button
                                onClick={handleLogout}
                                className="ml-4 px-4 py-2 text-sm text-red-600 hover:text-red-800"
                            >
                                Вийти
                            </button>
                        ) : (
                            <div className="flex space-x-4">
                                <Link
                                    to="/login"
                                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Увійти
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                                >
                                    Реєстрація
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="min-h-screen bg-gray-100">
                <Navigation />
                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/" element={<PhotoGrid />} />
                        <Route path="/photos/:id" element={<PhotoDetail />} />
                        <Route
                            path="/upload"
                            element={
                                <PrivateRoute>
                                    <UploadPhoto />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <PrivateRoute>
                                    <Profile />
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App; 
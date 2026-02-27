import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from '@react-oauth/google';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import CreateOrder from './pages/CreateOrder';
import ImportCSV from './pages/ImportCSV';

const queryClient = new QueryClient();
const GOOGLE_CLIENT_ID = '908799478197-8u1cq9q502h02uvt3ehb5ted2s47u2gv.apps.googleusercontent.com'; // Отримайте з Google Cloud Console

function App() {
  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    // Перевіряємо чи є збережений користувач
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (credentialResponse: any) => {
    // Тут ви можете відправити токен на ваш бекенд для верифікації
    console.log('Login Success:', credentialResponse);
    
    // Для демо - зберігаємо інформацію про користувача
    const userData = {
      name: credentialResponse.name || 'Google User',
      email: credentialResponse.email,
      picture: credentialResponse.picture
    };
    
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setShowLogin(false);
    toast.success(`Welcome, ${userData.name}!`);
  };

  const handleLoginError = () => {
    toast.error('Google login failed');
  };

  const handleLogout = () => {
    googleLogout();
    setUser(null);
    localStorage.removeItem('user');
    toast.info('Logged out successfully');
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            {/* Header з інформацією про користувача */}
            <header className="bg-white shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                  <div className="flex items-center">
                    <Link to="/" className="text-xl font-bold text-indigo-600">
                      Wellness Kits
                    </Link>
                    <nav className="ml-10 flex space-x-8">
                      <Link to="/" className="text-gray-700 hover:text-indigo-600">
                        Dashboard
                      </Link>
                      <Link to="/create" className="text-gray-700 hover:text-indigo-600">
                        Create Order
                      </Link>
                      <Link to="/import" className="text-gray-700 hover:text-indigo-600">
                        Import CSV
                      </Link>
                    </nav>
                  </div>
                  
                  <div className="flex items-center">
                    {user ? (
                      <div className="flex items-center space-x-4">
                        {user.picture && (
                          <img 
                            src={user.picture} 
                            alt={user.name}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <span className="text-sm text-gray-700">{user.name}</span>
                        <button
                          onClick={handleLogout}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Logout
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowLogin(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700"
                      >
                        Sign in with Google
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </header>

            {/* Modal для Google Login */}
            {showLogin && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full">
                  <h2 className="text-2xl font-bold mb-6 text-center">Sign in to Wellness Kits</h2>
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleLoginSuccess}
                      onError={handleLoginError}
                      useOneTap
                    />
                  </div>
                  <button
                    onClick={() => setShowLogin(false)}
                    className="mt-4 w-full text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Основний контент - доступний без логіна */}
            <main className="py-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/create" element={<CreateOrder />} />
                  <Route path="/import" element={<ImportCSV />} />
                </Routes>
              </div>
            </main>
          </div>
          <ToastContainer position="top-right" autoClose={5000} />
        </BrowserRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Ventas from './components/Ventas';
import AuthService from './components/AuthService';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!AuthService.getCurrentUser());

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (username, password) => {
    try {
      await AuthService.login(username, password);
      setIsAuthenticated(true); // Cambia el estado a autenticado sin recargar
    } catch (error) {
      alert('Usuario incorrecto');
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false); // Cambia el estado a no autenticado sin recargar
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/ventas" replace />} 
        />
        <Route 
          path="/ventas" 
          element={isAuthenticated ? <Ventas onLogout={handleLogout} /> : <Navigate to="/" replace />} 
        />
      </Routes>
    </Router>
  );
};

export default App;

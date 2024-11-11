// import React, { useEffect } from 'react';
// import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// import Login from './components/Login';
// import Ventas from './components/Ventas';
// import AuthService from './components/AuthService';

// const App = () => {
//   useEffect(() => {
//     AuthService.clearStorage(); // Limpia el localStorage al inicio de la aplicación
//   }, []);

//   const user = AuthService.getCurrentUser(); // Obtén el usuario actual

//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={user ? <Navigate to="/ventas" /> : <Login />} /> {/* Redirigir a /ventas si hay usuario */}
//         <Route path="/ventas" element={user ? <Ventas /> : <Navigate to="/" />} /> {/* Redirigir a / si no hay usuario */}
//       </Routes>
//     </Router>
//   );
// };

// export default App;
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
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
      setIsAuthenticated(true);  // Actualizar autenticación a true
    } catch {
      alert('Usuario incorrecto');
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false); 
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/ventas" />} 
        />
        <Route 
          path="/ventas" 
          element={isAuthenticated ? <Ventas onLogout={handleLogout} /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
};

export default App;


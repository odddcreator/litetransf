import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Login from './components/Login';
import Upload from './components/Upload';
import MyTexts from './components/MyTexts';
import MyMedia from './components/MyMedia';
import Premium from './components/Premium';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setUser({ id: decoded.userId });
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  if (!token) return <Login onLogin={handleLogin} />;

  return (
  <Router>
    <div className="app">
      <header>LITETRANSF</header>
      <nav>
        <a href="/upload">UPLOAD</a>
        <a href="/my-texts">MY TEXTS</a>
        <a href="/my-media">MY MEDIA</a>
        <a href="/premium">PREMIUM</a>
      </nav>

      <Routes>
        <Route path="/upload" element={<Upload />} />
        <Route path="/my-texts" element={<MyTexts />} />
        <Route path="/my-media" element={<MyMedia />} />
        <Route path="/premium" element={<Premium />} />
        
        {/* Catch-all: redirect to /upload (like the old Redirect) */}
        <Route path="*" element={<Navigate to="/upload" replace />} />
      </Routes>
    </div>
  </Router>
  );
}

export default App;
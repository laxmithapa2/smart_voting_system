import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import VotingBooth from './pages/VotingBooth';
import Results from './pages/Results';
import { useState, useEffect } from 'react';

function ProtectedRoutes() {
  const isAdmin = sessionStorage.getItem('admin_session');
  if (!isAdmin) return <Navigate to="/login" replace />;
  
  return (
    <div className="app-layout">
      <Navbar />
      <main className="container animate-fade-in">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/vote" element={<VotingBooth />} />
          <Route path="/results" element={<Results />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>
    </Router>
  );
}

export default App;

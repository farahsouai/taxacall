import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import HomePage from './components/HomePage';

function App() {
  const [showLogin, setShowLogin] = useState(true); // true = login, false = register

  const toggleForm = () => {
    setShowLogin(!showLogin);
  };

  return (
    <Router>
    <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
      <nav>
        
      </nav>

        <Routes>
          {/* Redirection automatique de "/" vers "/auth" */}
          <Route path="/" element={<Navigate to="/auth" />} />

          <Route path="/auth" element={
            <>
            <h1 className="app-title">TaxaCall</h1>
          
            {showLogin ? <LoginForm /> : <RegisterForm />}
          
            <button className="btn-primary" onClick={toggleForm} style={{ marginTop: '20px' }}>
              {showLogin ? "Créer un compte" : "Déjà inscrit ? Se connecter"}
            </button>
          </>
          
          } />

          <Route path="/home" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

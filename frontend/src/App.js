import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import HomePage from './components/HomePage';
import AppelList from './components/AppelList';
import HistoriqueCout from './components/HistoriqueCout';
import GestionUtilisateurs from "./components/GestionUtilisateurs";
import UtilisateurForm from "./components/UtilisateurForm";





function App() {
  const [showLogin, setShowLogin] = useState(true); // true = login, false = register
  const [afficherGestion, setAfficherGestion] = useState(false);
  const toggleForm = () => {
    setShowLogin(!showLogin);
  };

  return (
    <Router>
    <div style={{  margin: '0 auto', textAlign: 'center' }}>
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
           
<Route path="/auth" element={<LoginForm />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/appels" element={<AppelList />} />
          <Route path="/historique-cout" element={<HistoriqueCout />} />
          <Route path="/home" element={<GestionUtilisateurs />} />
    <Route path="/utilisateur" element={<UtilisateurForm />} />
    <Route path="/utilisateur/:id" element={<UtilisateurForm />} />
    <Route path="/gestion-utilisateurs" element={<GestionUtilisateurs />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

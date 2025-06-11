import React, { useState } from 'react';
import './LoginForm.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginForm = () => {
  const [numeroPoste, setNumeroPoste] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState(null);
  const [motDePasseVisible, setMotDePasseVisible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3005/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numeroPoste, motDePasse })
      });

      const data = await response.json();

      if (!response.ok) {
        setErreur(data.error || 'Erreur lors de la connexion');
        return;
      }

      localStorage.setItem('userRole', data.utilisateur.role);
      localStorage.setItem('numeroPoste', data.utilisateur.numeroPoste);
      localStorage.setItem('nom', data.utilisateur.nom);
      localStorage.setItem('prenom', data.utilisateur.prenom);

      window.location.href = '/home';
    } catch (err) {
      setErreur('Erreur réseau ou serveur.');
    }
  };

  return (
    <div className="login-container">
      <div className="container-auth">
        <img
          src="/assets/logo-poulina.png"
          alt="Logo Poulina"
          className="logo-poulina"
        />
      </div>
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Numéro de poste"
          value={numeroPoste}
          onChange={(e) => setNumeroPoste(e.target.value)}
          required
        />
        <div style={{ position: 'relative' }}>
          <input
            type={motDePasseVisible ? 'text' : 'password'}
            placeholder="Mot de passe"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
          />
          <span
            onClick={() => setMotDePasseVisible(!motDePasseVisible)}
            style={{
              position: 'absolute',
              top: '50%',
              right: '10px',
              transform: 'translateY(-50%)',
              cursor: 'pointer'
            }}
          >
            {motDePasseVisible ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <button type="submit">Se connecter</button>
        {erreur && <p style={{ color: 'red' }}>{erreur}</p>}
      </form>
    </div>
  );
};

export default LoginForm;

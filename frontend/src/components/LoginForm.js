import React, { useState } from 'react';
import './LoginForm.css';

const LoginForm = () => {
  const [numeroPoste, setNumeroPoste] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState(null);

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

      // Stocker les données utiles en local
      localStorage.setItem('userRole', data.utilisateur.role);
      localStorage.setItem('numeroPoste', data.utilisateur.numeroPoste);
      localStorage.setItem('nom', data.utilisateur.nom);
      localStorage.setItem('prenom', data.utilisateur.prenom);

      // Rediriger vers la HomePage
      window.location.href = '/home';
    } catch (err) {
      setErreur('Erreur réseau ou serveur.');
    }
  };

  return (
    <div className="login-container">
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Numéro de poste"
          value={numeroPoste}
          onChange={(e) => setNumeroPoste(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          required
        />
        <button type="submit">Se connecter</button>
        {erreur && <p style={{ color: 'red' }}>{erreur}</p>}
      </form>
    </div>
  );
};

export default LoginForm;

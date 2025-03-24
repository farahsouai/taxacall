import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Si tu ajoutes le token plus tard : localStorage.removeItem('token');
    navigate('/auth');
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Bouton en haut à droite */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: '#A58D7F',
            color: '#fff',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Se déconnecter
        </button>
      </div>

      {/* Message de bienvenue centré */}
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h1>Bienvenue sur la page d'accueil</h1>
        <p>Vous êtes connecté(e) !</p>
      </div>
    </div>
  );
};

export default HomePage;

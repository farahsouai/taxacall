import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [form, setForm] = useState({
    email: '', // ✅ renommé
    motDePasse: '', // ✅ renommé
  });

  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
    const res = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Bienvenue, ${data.utilisateur.nom} (${data.utilisateur.role})`);
        navigate('/home');
      } else {
        setMessage(data.error || 'Erreur');
      }
    } catch (err) {
      setMessage('Erreur de connexion');
    }
  };

  return (
    <div className="container-auth">
    <img
      src="/assets/logo-poulina.png"
      alt="Logo Poulina"
      className="logo-poulina"
    />
    
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit}>
  <div className="input-icon-group">
    <i className="fas fa-envelope"></i>
    <input
      type="email"
      name="email"
      placeholder="Email"
      value={form.email}
      onChange={handleChange}
      required
    />
  </div>

  <div className="input-icon-group">
    <i className="fas fa-lock"></i>
    <input
      type="password"
      name="motDePasse"
      placeholder="Mot de passe"
      value={form.motDePasse}
      onChange={handleChange}
      required
    />
  </div>  
        <button type="submit">Se connecter</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default LoginForm;

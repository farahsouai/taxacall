import React, { useState } from 'react';

const RegisterForm = () => {
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    role: 'ADMIN',
  });
  

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    const res = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
      } else {
        setMessage(data.error || 'Erreur');
      }
    } catch (err) {
      setMessage("Erreur de connexion");
    }
  };

  return (
    
    <div className="container-auth">
    <img
      src="/assets/logo-poulina.png"
      alt="Logo Poulina"
      className="logo-poulina"
    />
      <h2>Inscription</h2>
      <form onSubmit={handleSubmit}>
  <div className="input-icon-group">
    <i className="fas fa-user"></i>
    <input
      name="nom"
      placeholder="Nom"
      value={form.nom}
      onChange={handleChange}
      required
    />
  </div>

  <div className="input-icon-group">
    <i className="fas fa-user"></i>
    <input
      name="prenom"
      placeholder="Prénom"
      value={form.prenom}
      onChange={handleChange}
      required
    />
  </div>

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

  <select name="role" value={form.role} onChange={handleChange}>
    <option value="UTILISATEUR">UTILISATEUR</option>
    <option value="ADMIN">ADMIN</option>
  </select>

  <br /><br />
  <button type="submit">S'inscrire</button>
</form>

      {message && <p>{message}</p>}
    </div>

    
  );
};

export default RegisterForm;

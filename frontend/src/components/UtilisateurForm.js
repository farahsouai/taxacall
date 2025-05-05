import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./GestionUtilisateurs.css";

const UtilisateurForm = () => {
  const { id } = useParams(); // Si id existe => modification
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    numeroPoste: "",
    motDePasse: "",
    role: "UTILISATEUR",
  });

  const [numerosDisponibles, setNumerosDisponibles] = useState([]);

  useEffect(() => {
    // Si modification, charger l'utilisateur
    if (id) {
      fetch(`http://localhost:3005/utilisateurs/${id}`)
        .then((res) => res.json())
        .then((data) => setForm({ ...data, motDePasse: "" }));
    }

    // Charger les numéros de poste disponibles
    fetch("http://localhost:3005/utilisateurs/numeros-cdr")
      .then((res) => res.json())
      .then((data) => setNumerosDisponibles(data))
      .catch((err) => console.error("Erreur chargement numéros CDR :", err));
  }, [id]);

  // Remplir nom/prenom depuis utilisateurs_poulina
  useEffect(() => {
    if (!id && form.numeroPoste) {
      fetch(`http://localhost:3005/utilisateurs-poulina/${form.numeroPoste}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.nom && data.prenom) {
            setForm((prev) => ({ ...prev, nom: data.nom, prenom: data.prenom }));
          }
        })
        .catch((err) => console.log("Aucun utilisateur Poulina trouvé :", err));
    }
  }, [form.numeroPoste, id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const method = id ? "PUT" : "POST";
    const url = id
      ? `http://localhost:3005/utilisateurs/${id}`
      : "http://localhost:3005/utilisateurs";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(() => navigate("/gestion-utilisateurs"))
      .catch((err) => console.error("Erreur enregistrement :", err));
  };

  const handleRetour = () => {
    navigate("/gestion-utilisateurs");
  };

  return (
    <div className="gestion-container">
      <div className="retour" onClick={handleRetour}>
        ← Retour à la gestion des utilisateurs
      </div>
      <button className="fermer-button" onClick={() => navigate("/home")}>
        ❌ Fermer
      </button>

      <h2>{id ? "✏️ Modifier Utilisateur" : "➕ Ajouter Utilisateur"}</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="nom"
          value={form.nom}
          onChange={handleChange}
          placeholder="Nom"
          required
        />
        <input
          name="prenom"
          value={form.prenom}
          onChange={handleChange}
          placeholder="Prénom"
          required
        />

        {/* Numéro de poste */}
        {!id ? (
          <select
            name="numeroPoste"
            value={form.numeroPoste}
            onChange={handleChange}
            required
          >
            <option value="">-- Sélectionner un numéro de poste --</option>
            {numerosDisponibles.map((num, index) => (
              <option key={index} value={num}>
                {num}
              </option>
            ))}
          </select>
        ) : (
          <input
            name="numeroPoste"
            value={form.numeroPoste}
            readOnly
            className="readonly-input"
            placeholder="Numéro de poste"
          />
        )}

        {!id && (
          <input
            type="password"
            name="motDePasse"
            value={form.motDePasse}
            onChange={handleChange}
            placeholder="Mot de passe"
            required
          />
        )}

        <select name="role" value={form.role} onChange={handleChange}>
          <option value="UTILISATEUR">Utilisateur</option>
          <option value="ADMIN">Admin</option>
        </select>

        <button type="submit">{id ? "Modifier" : "Ajouter"}</button>
      </form>
    </div>
  );
};

export default UtilisateurForm;
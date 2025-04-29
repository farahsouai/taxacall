import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GestionUtilisateurs.css";

const GestionUtilisateurs = () => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3001/utilisateurs")
      .then((res) => res.json())
      .then((data) => setUtilisateurs(data))
      .catch((err) => console.error("❌ Erreur chargement utilisateurs :", err));
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("❗ Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      fetch(`http://localhost:3001/utilisateurs/${id}`, { method: "DELETE" })
        .then(() => {
          setUtilisateurs(utilisateurs.filter((u) => u.id !== id));
        })
        .catch((err) => console.error("❌ Erreur suppression :", err));
    }
  };

  return (
    
    <div className="gestion-container">
      <button className="fermer-button" onClick={() => navigate("/home")}>❌ Fermer</button>

      <h2>👥 Gestion des Utilisateurs</h2>
      <button className="ajouter-btn" onClick={() => navigate("/utilisateur")}>
        ➕ Ajouter un utilisateur
      </button>

      <table className="utilisateurs-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Numéro de poste</th>
            <th>Rôle</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {utilisateurs.map((u) => (
            <tr key={u.id}>
              <td>{u.nom}</td>
              <td>{u.prenom}</td>
              <td>{u.numeroPoste}</td>
              <td>{u.role}</td>
              <td>
                <button className="modifier-btn" onClick={() => navigate(`/utilisateur/${u.id}`)}>
                  ✏️ Modifier
                </button>
                <button className="supprimer-btn" onClick={() => handleDelete(u.id)}>
                  🗑️ Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GestionUtilisateurs;

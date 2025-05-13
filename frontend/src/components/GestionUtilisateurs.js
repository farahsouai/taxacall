import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GestionUtilisateurs.css";

const GestionUtilisateurs = ({ onAfficherUtilisateur, isAdmin }) => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3005/utilisateurs")
      .then((res) => res.json())
      .then((data) => setUtilisateurs(data))
      .catch((err) => console.error("❌ Erreur chargement utilisateurs :", err));
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("❗ Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      fetch(`http://localhost:3005/utilisateurs/${id}`, { method: "DELETE" })
        .then(() => {
          setUtilisateurs(utilisateurs.filter((u) => u.id !== id));
        })
        .catch((err) => console.error("❌ Erreur suppression :", err));
    }
  };

  return (
    <div className="gestion-container">
      

      <h2>👥 Gestion des Utilisateurs</h2>
      {isAdmin && (
        <button className="ajouter-btn" onClick={() => navigate("/utilisateur")}>
          ➕ Ajouter un utilisateur
        </button>
      )}

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
              {!isAdmin && onAfficherUtilisateur && (
  <button className="afficher-btn" onClick={() => onAfficherUtilisateur(u)}>
    👁️ Afficher
  </button>
)}

                {isAdmin && (
                  <>
                    <button className="modifier-btn" onClick={() => navigate(`/utilisateur/${u.id}`)}>
                      ✏️ Modifier
                    </button>
                    <button className="supprimer-btn" onClick={() => handleDelete(u.id)}>
                      🗑️ Supprimer
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GestionUtilisateurs;

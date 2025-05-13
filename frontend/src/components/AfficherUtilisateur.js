// src/components/AfficherUtilisateur.js
import React from "react";
import "./AfficherUtilisateur.css";

const AfficherUtilisateur = ({ utilisateur, onClose }) => {
  if (!utilisateur) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h3>👁️ Détails de l'utilisateur</h3>
        <p><strong>Nom :</strong> {utilisateur.nom}</p>
        <p><strong>Prénom :</strong> {utilisateur.prenom}</p>
        <p><strong>Numéro de poste :</strong> {utilisateur.numeroPoste}</p>
        <p><strong>Rôle :</strong> {utilisateur.role}</p>
        <button onClick={onClose} className="fermer-btn">Fermer</button>
      </div>
    </div>
  );
};

export default AfficherUtilisateur;

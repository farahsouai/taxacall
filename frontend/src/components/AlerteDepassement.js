import React, { useEffect, useState } from 'react';
import './AlerteDepassement.css';

const AlerteDepassement = () => {
  const [alertes, setAlertes] = useState([]);
  const [searchPoste, setSearchPoste] = useState('');

  const fetchAlertes = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/alertes');
      const data = await res.json();
      setAlertes(data);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des alertes :', error);
    }
  };

  useEffect(() => {
    fetchAlertes();
  }, []);

  const alertesFiltrees = alertes.filter((a) =>
    a.numeroPoste.toLowerCase().includes(searchPoste.toLowerCase())
  );

  return (
    <div className="alerte-container">
      <h2>🚨 Alertes de dépassement de seuil</h2>

      <div className="filtre-numero-poste">
        <input
          type="text"
          placeholder="🔍 Rechercher par numéro de poste"
          value={searchPoste}
          onChange={(e) => setSearchPoste(e.target.value)}
        />
      </div>

      <table className="alerte-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Numéro Poste</th>
            <th>Coût</th>
            <th>Seuil</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {alertesFiltrees.length > 0 ? (
            alertesFiltrees.map((a, idx) => (
              <tr key={idx}>
                <td>{a.nom}</td>
                <td>{a.prenom}</td>
                <td>{a.numeroPoste}</td>
                <td>{a.cout} DT</td>
                <td>{a.seuil} DT</td>
                <td>{new Date(a.date).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">Aucune alerte trouvée</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AlerteDepassement;
import React, { useState } from 'react';
import './HistoriqueCout.css';
import AlerteDepassement from "./AlerteDepassement";

const HistoriqueCout = () => {
  const [mois, setMois] = useState('');
  const [utilisateurId, setUtilisateurId] = useState('');
  const [resultats, setResultats] = useState([]);
  const [showAlerte, setShowAlerte] = useState(false);

  const fetchCout = async () => {
    try {
      if (!mois || !utilisateurId) {
        console.warn("❌ Mois et ID utilisateur sont requis !");
        return;
      }

      const moisInt = parseInt(mois.split("-")[1], 10);
      const res = await fetch(`http://localhost:3001/api/historique-cout?mois=${moisInt}&utilisateur_id=${utilisateurId}`);


      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`);
      }

      const data = await res.json();
      setResultats(data);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des données:', error);
    }
  };

  return (
    <div className="historique-container">
      <h2>📊 Historique des coûts</h2>
      <div className="filters">
        <input
          type="month"
          value={mois}
          onChange={(e) => setMois(e.target.value)}
          placeholder="Mois"
        />
        <input
          type="text"
          value={utilisateurId}
          onChange={(e) => setUtilisateurId(e.target.value)}
          placeholder="ID Utilisateur"
        />
        <button onClick={fetchCout}>Filtrer</button>
        <button onClick={() => setShowAlerte(true)} className="btn-alerte">Voir Alertes</button>
      </div>

      <table className="historique-table">
        <thead>
          <tr>
            <th>Mois</th>
            <th>Utilisateur</th>
            <th>Coût total (DT)</th>
          </tr>
        </thead>
        <tbody>
          {resultats.length > 0 ? (
            resultats.map((r, idx) => (
              <tr key={idx}>
                <td>{new Date(2025, r.mois - 1).toLocaleString('fr-FR', { month: 'long' })}</td>
                <td>{r.utilisateur_id}</td>
                <td>{r.total}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">Aucun résultat trouvé</td>
            </tr>
          )}
        </tbody>
      </table>

      {showAlerte && <AlerteDepassement onClose={() => setShowAlerte(false)} />}
    </div>
  );
};

export default HistoriqueCout;

import React, { useEffect, useState } from 'react';
import './HistoriqueCout.css';
import AlerteDepassement from "./AlerteDepassement";

const HistoriqueCout = () => {
  const [mois, setMois] = useState('');
  const [utilisateurId, setUtilisateurId] = useState('');
  const [resultats, setResultats] = useState([]);
  const [showAlerte, setShowAlerte] = useState(false);
  const [utilisateurs, setUtilisateurs] = useState([]);

  // 🔄 Charger les utilisateurs au montage
  useEffect(() => {
    fetch("http://localhost:3005/api/utilisateurs")
      .then(res => res.json())
      .then(data => setUtilisateurs(data))
      .catch(err => console.error("Erreur chargement utilisateurs:", err));
  }, []);

  const fetchCout = async () => {
    try {
      if (!mois || !utilisateurId) {
        console.warn("❌ Mois et ID utilisateur sont requis !");
        return;
      }

      const moisInt = parseInt(mois.split("-")[1], 10);
      const res = await fetch(`http://localhost:3005/api/historique-cout?mois=${moisInt}&numeroPoste=${utilisateurId}`);

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

        {/* ✅ Liste déroulante des numéros de poste */}
        <select value={utilisateurId} onChange={(e) => setUtilisateurId(e.target.value)}>
          <option value="">-- numéro de poste --</option>
          {utilisateurs.map((u) => (
            <option key={u.numeroPoste} value={u.numeroPoste}>
            {u.numeroPoste}
          </option>
          
          ))}
        </select>

        <button onClick={fetchCout}>Filtrer</button>
       
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

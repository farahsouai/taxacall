import React, { useEffect, useState } from 'react';
import './HistoriqueCout.css';

const HistoriqueCout = () => {
  const [listePostes, setListePostes] = useState([]);
  const [numeroPoste, setNumeroPoste] = useState('');
  const [resultats, setResultats] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3005/api/historique/postes')
      .then(res => res.json())
      .then(data => setListePostes(data))
      .catch(err => console.error('❌ Erreur récupération postes :', err));
  }, []);

  const handleFiltrer = () => {
    if (!numeroPoste) return;
    fetch(`http://localhost:3005/api/historique/historique-cout?numeroPoste=${numeroPoste}`)
      .then(res => res.json())
      .then(setResultats)
      .catch(err => console.error('❌ Erreur historique coût :', err));
  };

  return (
    <div className="historique-container">
      <h2>📊 Historique des coûts</h2>

      <div className="filtre-container">
        <select value={numeroPoste} onChange={e => setNumeroPoste(e.target.value)}>
          <option value="">-- numéro de poste --</option>
          {listePostes.map((poste, idx) => (
            <option key={idx} value={poste}>{poste}</option>
          ))}
        </select>
        <button onClick={handleFiltrer}>Filtrer</button>
      </div>

      <table className="historique-table">
        <thead>
          <tr>
            <th>Mois</th>
            <th>Année</th>
            <th>Coût total (DT)</th>
          </tr>
        </thead>
        <tbody>
          {resultats.length > 0 ? (
            resultats.map((r, i) => (
              <tr key={i}>
                <td>{r.mois}</td>
                <td>{r.annee}</td>
                <td>{Number(r.total).toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="3">Aucun résultat trouvé</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HistoriqueCout;

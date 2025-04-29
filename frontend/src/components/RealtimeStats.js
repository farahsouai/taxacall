import React, { useEffect, useState } from 'react';
import './RealtimeStats.css';

const RealtimeStats = () => {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/appels/realtime-par-poste');

        const json = await res.json();
        setStats(json);
      } catch (err) {
        console.error('❌ Erreur chargement stats par poste :', err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="realtime-stats-container">
      <h2>📊 Top 20 postes – Appels du jour</h2>
      <table className="realtime-stats-table">
        <thead>
          <tr>
            <th>Poste</th>
            <th>Entrants</th>
            <th>Sortants</th>
            <th>Total</th>
            <th>Durée Totale</th>
            <th>Coût Total (DT)</th>
          </tr>
        </thead>
        <tbody>
          {stats.length === 0 ? (
            <tr>
              <td colSpan="6">Aucune donnée pour le moment</td>
            </tr>
          ) : (
            stats.map((row, i) => (
              <tr key={i}>
                <td>{row.numeroPoste}</td>
                <td className="inbound">{row.appelsEntrants}</td>
                <td className="outbound">{row.appelsSortants}</td>
                <td className="total">{row.totalAppels}</td>
                <td>{row.dureeTotale}</td>
                <td>{row.coutTotal}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RealtimeStats;

import React, { useEffect, useState, useRef } from 'react';
import './AppelJournalier.css';

const AppelJournalier = () => {
  const [appels, setAppels] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("TOUS");
  const tableRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const fetchAppels = () => {
    fetch("http://localhost:3005/api/journal-appels")
      .then(res => {
        if (!res.ok) throw new Error("Erreur lors du chargement des données");
        return res.json();
      })
      .then(data => {
        setAppels(data);
        setError(null);
        tableRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch(err => {
        console.error("Erreur appels :", err);
        setError("Impossible de charger les appels journaliers.");
      });
  };

  useEffect(() => {
    fetchAppels();
  }, []);

  const filteredAppels = appels.filter(appel => {
    if (filter === "TOUS") return true;
    return appel.type?.toLowerCase() === filter.toLowerCase();
  });

  const handleScroll = () => {
    if (tableRef.current) {
      setShowScrollTop(tableRef.current.scrollTop > 200);
    }
  };

  const handleScrollTop = () => {
    tableRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="journal-container">
      <div className="filter-buttons">
        <button onClick={() => setFilter("TOUS")} className={filter === "TOUS" ? "active" : ""}>Tous</button>
        <button onClick={() => setFilter("entrant")} className={filter === "entrant" ? "active" : ""}>Entrants</button>
        <button onClick={() => setFilter("sortant")} className={filter === "sortant" ? "active" : ""}>Sortants</button>
      </div>

      <h2 className="date-title">{new Date().toLocaleDateString()}</h2>

      <p className="compteur-appels">Nombre d'appels : {filteredAppels.length}</p>

      {error && <div className="error-message">{error}</div>}

      <div
        className="table-scroll-wrapper"
        ref={tableRef}
        onScroll={handleScroll}
      >
        <table>
          <thead>
            <tr>
              <th>Heure</th>
              <th>Numéro</th>
              <th>Nom</th>
              <th>Durée</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppels.map((a, i) => (
              <tr key={i}>
                <td>{a.heure}</td>
                <td>{a.numero}</td>
                <td>{a.nom || "---"}</td>
                <td>{a.duree || "--"}</td>
                <td className={`type ${a.type?.toLowerCase() || ''}`}> {a.type ? a.type.charAt(0).toUpperCase() + a.type.slice(1) : ''}
</td>


              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showScrollTop && (
        <button className="scroll-top-button" onClick={handleScrollTop}>
          ⬆ Haut
        </button>
      )}
    </div>
  );
};

export default AppelJournalier;

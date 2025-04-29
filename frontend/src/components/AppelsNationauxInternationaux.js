import React, { useState, useEffect } from 'react';

const AppelsNationauxInternationaux = () => {
  const [resultats, setResultats] = useState([]);
  const [numeroPoste, setNumeroPoste] = useState('');

  const handleSearch = () => {
    if (!numeroPoste) return;

    fetch(`http://localhost:3001/appels/internationaux/${numeroPoste}`)

      .then(response => response.json())
      .then(data => setResultats(data))
      .catch(error => console.error("❌ Erreur lors de la récupération des appels :", error));
  };

  return (
    <div>
      <h2>🌍 Recherche Appels Internationaux par Numéro de Poste</h2>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Entrer le numéro de poste"
          value={numeroPoste}
          onChange={(e) => setNumeroPoste(e.target.value)}
        />
        <button onClick={handleSearch}>🔍 Rechercher</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>dateAppel</th>
            <th>Numéro</th>
            <th>Opérateur</th>
            <th>Pays</th>
            <th>Durée</th>
            <th>Coût (DT)</th>
            <th>Filiale</th>
          </tr>
        </thead>
        <tbody>
          {resultats.length > 0 ? (
            resultats.map((appel) => (
              <tr key={appel.id}>
                <td>{appel.dateAppel}</td>
                <td>{appel.numero}</td>
                <td>{appel.operateur}</td>
                <td>{appel.pays}</td>
                <td>{appel.duree}</td>
                <td>{appel.cout}</td>
                <td>{appel.filiale}</td>
              </tr>
            ))
          ) : (
            <tr>
              
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AppelsNationauxInternationaux;

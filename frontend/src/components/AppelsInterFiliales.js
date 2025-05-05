import React, { useState, useEffect } from 'react';

const AppelsInterFiliales = () => {
  const [devicePools, setDevicePools] = useState([]);
  const [selectedPool, setSelectedPool] = useState('');
  const [filiale, setFiliale] = useState(null);
  const [error, setError] = useState(null);

  // Charger la liste unique des device pools au démarrage
  useEffect(() => {
    fetch('http://localhost:3005/api/filiales') // suppose que cette route renvoie toutes les filiales
      .then(res => res.json())
      .then(data => {
        const pools = [...new Set(data.map(f => f.device_pool))];
        setDevicePools(pools.sort((a, b) => a - b));
      })
      .catch(err => {
        console.error("❌ Erreur chargement Device Pools :", err);
        setError("Erreur de chargement des Device Pools");
      });
  }, []);

  const handleSearch = (pool) => {
    fetch(`http://localhost:3005/api/filiales/by-device-pool/${pool}`)
      .then(res => {
        if (!res.ok) throw new Error("Filiale non trouvée");
        return res.json();
      })
      .then(data => {
        setFiliale(data);
        setError(null);
      })
      .catch(err => {
        setFiliale(null);
        setError(err.message || "Erreur");
      });
  };

  return (
    <div className="container">
      <h2>🔍 Filiale </h2>

      <select
        value={selectedPool}
        onChange={(e) => {
          const value = e.target.value;
          setSelectedPool(value);
          handleSearch(value);
        }}
      >
        <option value="">-- Sélectionner un Device Pool --</option>
        {devicePools.map((pool, index) => (
          <option key={index} value={pool}>{pool}</option>
        ))}
      </select>

      {filiale && (
        <div className="result">
          <h3>Résultat :</h3>
          <p><strong>Nom de la filiale :</strong> {filiale.nom}</p>
          <p><strong>Device Pool :</strong> {filiale.device_pool}</p>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default AppelsInterFiliales;

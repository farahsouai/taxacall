import React, { useState, useEffect } from 'react';
import './GatewayPrefixeSearch.css';

const GatewaySearch = () => {
  const [ip, setIp] = useState('');
  const [gateway, setGateway] = useState(null);
  const [gatewayList, setGatewayList] = useState([]);
  const [rechercheUtilisateur, setRechercheUtilisateur] = useState('');
  const [triAscendant, setTriAscendant] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/gateways')
      .then(res => res.json())
      .then(data => setGatewayList(data))
      .catch(err => console.error('Erreur chargement gateways:', err));
  }, []);

  const rechercherGateway = () => {
    fetch(`http://localhost:3001/api/gateways/${ip}`)
      .then(res => res.json())
      .then(data => {
        setGateway(data);
        setRechercheUtilisateur(''); // 🔄 Réinitialise le champ de recherche
      })
      .catch(err => console.error('Erreur Gateway:', err));
  };

  // 🔍 Filtrage des utilisateurs
  const utilisateursFiltres = gateway?.utilisateurs
    ?.filter(user =>
      user.nom.toLowerCase().includes(rechercheUtilisateur.toLowerCase()) ||
      user.prenom.toLowerCase().includes(rechercheUtilisateur.toLowerCase()) ||
      user.poste.toString().includes(rechercheUtilisateur)
    )
    .sort((a, b) => {
      if (triAscendant) {
        return a.nom.localeCompare(b.nom);
      } else {
        return b.nom.localeCompare(a.nom);
      }
    });

  return (
    <div style={{ textAlign: 'center', marginTop: '30px' }}>
      <h2>🔌 Recherche Gateway</h2>

      <select value={ip} onChange={(e) => setIp(e.target.value)}>
        <option value="">-- Sélectionner IP --</option>
        {gatewayList.map((gw, i) => (
          <option key={i} value={gw.ip}>{gw.ip}</option>
        ))}
      </select>

      <button onClick={rechercherGateway} disabled={!ip} style={{ marginLeft: '10px' }}>
        Rechercher Gateway
      </button>

      {gateway && (
        <div style={{ marginTop: '30px' }}>
          <p><strong>Description:</strong> {gateway.description}</p>

          {gateway.utilisateurs && gateway.utilisateurs.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <h3>👥 Utilisateurs du groupe {gateway.description}</h3>

              {/* 🔍 Recherche */}
              <input
                type="text"
                placeholder="Rechercher par nom, prénom ou poste"
                value={rechercheUtilisateur}
                onChange={(e) => setRechercheUtilisateur(e.target.value)}
                style={{
                  padding: '8px',
                  marginBottom: '15px',
                  width: '300px',
                  border: '1px solid #ccc',
                  borderRadius: '5px'
                }}
              />

              {/* 🔁 Tri bouton */}
              <button
                onClick={() => setTriAscendant(!triAscendant)}
                style={{
                  marginLeft: '10px',
                  padding: '8px 12px',
                  backgroundColor: '#0073A8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Trier par nom {triAscendant ? '🔼' : '🔽'}
              </button>

              {/* 🧾 Tableau utilisateurs */}
              <table className="prefixe-table" style={{ marginTop: '20px' }}>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Poste</th>
                    <th>Groupe</th>
                  </tr>
                </thead>
                <tbody>
                  {utilisateursFiltres?.length > 0 ? (
                    utilisateursFiltres.map((user, idx) => (
                      <tr key={idx}>
                        <td>{user.nom}</td>
                        <td>{user.prenom}</td>
                        <td>{user.poste}</td>
                        <td>{user.groupe}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">Aucun utilisateur trouvé</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GatewaySearch;

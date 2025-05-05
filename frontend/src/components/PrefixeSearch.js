import React, { useEffect, useState } from 'react';
import './GatewayPrefixeSearch.css';

const PrefixePage = () => {
  const [prefixeList, setPrefixeList] = useState([]);
  const [selectedTab, setSelectedTab] = useState('gestion');
  const [numero, setNumero] = useState('');
  const [resultat, setResultat] = useState(null);
  const [form, setForm] = useState({ prefixe: '', dest: '', prix: '' });
  const [editId, setEditId] = useState(null);
  const [afficherTableau, setAfficherTableau] = useState(false);
  const [filtre, setFiltre] = useState('');
  const [animationVisible, setAnimationVisible] = useState(false);

  useEffect(() => {
    chargerPrefixes();
  }, []);

  useEffect(() => {
    if (afficherTableau) {
      setAnimationVisible(true);
    } else {
      setTimeout(() => setAnimationVisible(false), 400);
    }
  }, [afficherTableau]);

  const chargerPrefixes = () => {
    fetch('http://localhost:3005/api/prefixes')
      .then(res => res.json())
      .then(data => setPrefixeList(data))
      .catch(err => console.error('Erreur chargement préfixes', err));
  };

  const rechercher = () => {
    if (!numero) return;
    fetch(`http://localhost:3005/api/prefixes/prix/${numero}`)
      .then(res => res.json())
      .then(data => setResultat(data))
      .catch(err => console.error('Erreur recherche prix', err));
  };

  const handleSubmit = () => {
    const method = editId ? 'PUT' : 'POST';
    const url = `http://localhost:3005/api/prefixes${editId ? '/' + editId : ''}`;

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(() => {
        setForm({ prefixe: '', dest: '', prix: '' });
        setEditId(null);
        chargerPrefixes();
      })
      .catch(err => console.error('Erreur soumission formulaire', err));
  };

  const handleEdit = (pfx) => {
    setForm({ prefixe: pfx.prefixe, dest: pfx.dest, prix: pfx.prix });
    setEditId(pfx.id);
  };

  const handleDelete = (id) => {
    if (window.confirm('Supprimer ce préfixe ?')) {
      fetch(`http://localhost:3005/api/prefixes/${id}`, { method: 'DELETE' })
        .then(() => chargerPrefixes())
        .catch(err => console.error('Erreur suppression', err));
    }
  };

  const prefixeFiltre = prefixeList.filter(
    (pfx) =>
      pfx.prefixe.toLowerCase().includes(filtre) ||
      pfx.dest.toLowerCase().includes(filtre)
  );

  return (
    <div style={{ textAlign: 'center', margin: '30px' }}>
      <div style={{ marginBottom: '30px' }}>
        <button
          onClick={() => setSelectedTab('gestion')}
          style={{
            backgroundColor: '#0073A8',
            color: 'white',
            padding: '10px 20px',
            marginRight: '10px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          📋 Gestion des Préfixes
        </button>
      </div>

      {selectedTab === 'gestion' && (
        <div>
          

          

          
          {resultat && (
            <div style={{ marginTop: '10px' }}>
              <p><strong>Prix (DT/min):</strong> {resultat.prix}</p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
            <input
              type="text"
              placeholder="Préfixe"
              value={form.prefixe}
              onChange={(e) => setForm({ ...form, prefixe: e.target.value })}
            />
            <input
              type="text"
              placeholder="Destination"
              value={form.dest}
              onChange={(e) => setForm({ ...form, dest: e.target.value })}
            />
            <input
              type="number"
              step="0.001"
              placeholder="Prix"
              value={form.prix}
              onChange={(e) => setForm({ ...form, prix: e.target.value })}
            />
            <button onClick={handleSubmit}>{editId ? 'Modifier' : 'Ajouter'}</button>
          </div>

          <button
            onClick={() => setAfficherTableau(!afficherTableau)}
            style={{
              backgroundColor: '#0073A8',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '5px',
              marginTop: '20px',
              marginBottom: '10px',
              cursor: 'pointer'
            }}
          >
            {afficherTableau ? '📂 Masquer la liste' : '📂 Afficher la liste'}
          </button>

          {(afficherTableau || animationVisible) && (
            <div className={`slide-container ${afficherTableau ? '' : 'hidden'}`}>
              {/* Liste déroulante de recherche (filtrage tableau) */}
              <select
                value={filtre}
                onChange={(e) => setFiltre(e.target.value.toLowerCase())}
                style={{
                  marginBottom: '15px',
                  padding: '8px',
                  width: '300px',
                  borderRadius: '5px',
                  border: '1px solid #ccc'
                }}
              >
                <option value="">-- Filtrer par Préfixe/Destination --</option>
                {prefixeList.map((pfx, i) => (
                  <option key={i} value={pfx.prefixe}>
                    {pfx.prefixe} - {pfx.dest}
                  </option>
                ))}
              </select>

              <table className="prefixe-table">
                <thead>
                  <tr>
                    <th>PRÉFIXE</th>
                    <th>DESTINATION</th>
                    <th>PRIX</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {prefixeFiltre.map((pfx) => (
                    <tr key={pfx.id}>
                      <td>{pfx.prefixe}</td>
                      <td>{pfx.dest}</td>
                      <td>{pfx.prix}</td>
                      <td>
                        <button onClick={() => handleEdit(pfx)}>✏️</button>
                        <button onClick={() => handleDelete(pfx.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PrefixePage;

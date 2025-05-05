import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function GatewayWithUsers() {
  const [gatewayList, setGatewayList] = useState([]);
  const [selectedIP, setSelectedIP] = useState('');
  const [users, setUsers] = useState([]);
  const [gatewayDetails, setGatewayDetails] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3005/api/gateways')
      .then(res => res.json())
      .then(setGatewayList)
      .catch(err => console.error("Erreur chargement gateways :", err));
  }, []);

  const handleIPChange = (e) => {
    setSelectedIP(e.target.value);
    setGatewayDetails(null);
    setUsers([]);
  };

  const fetchUsersForGateway = () => {
    fetch(`http://localhost:3005/api/gateways/${selectedIP}`)
      .then(res => res.json())
      .then(data => {
        setGatewayDetails({
          description: data.description,
          code: data.code,
          groupe: data.groupe
        });
        setUsers(data.utilisateurs || []);
      })
      .catch(err => console.error("Erreur chargement utilisateurs :", err));
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(users);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Utilisateurs');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(file, `utilisateurs_groupe_${gatewayDetails?.groupe}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Utilisateurs du groupe ${gatewayDetails?.groupe}`, 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Nom', 'Prénom', 'Poste', 'Email', 'Groupe']],
      body: users.map(u => [u.nom, u.prenom, u.numeroPoste, u.mail, u.groupe])
    });
    doc.save(`utilisateurs_groupe_${gatewayDetails?.groupe}.pdf`);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '40px', padding: '20px' }}>
      <h2 style={{ color: '#003366' }}>🔌 Gateways et Utilisateurs associés</h2>

      <div style={{ marginBottom: '20px' }}>
        <select
          value={selectedIP}
          onChange={handleIPChange}
          style={{
            padding: '8px',
            borderRadius: '5px',
            fontSize: '16px',
            marginRight: '10px',
          }}
        >
          <option value="">-- Sélectionner une IP --</option>
          {gatewayList.map((gateway, index) => (
            <option key={index} value={gateway.ip}>{gateway.ip}</option>
          ))}
        </select>

        <button
          onClick={fetchUsersForGateway}
          disabled={!selectedIP}
          style={{
            padding: '8px 15px',
            backgroundColor: '#0073A8',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Charger Utilisateurs
        </button>
      </div>

      {gatewayDetails && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginTop: '30px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={infoCardStyle}>
            <strong>📄 Description</strong>
            <div>{gatewayDetails.description}</div>
          </div>
          <div style={infoCardStyle}>
            <strong>📦 Code</strong>
            <div>{gatewayDetails.code}</div>
          </div>
          <div style={infoCardStyle}>
            <strong>👥 Groupe</strong>
            <div>{gatewayDetails.groupe}</div>
          </div>
        </div>
      )}

      {users.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <h3 style={{ color: '#003366' }}>
            Utilisateurs dans le groupe {gatewayDetails?.groupe}
          </h3>
          <table style={{
            borderCollapse: 'collapse',
            width: '80%',
            margin: 'auto',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          }}>
            <thead>
              <tr style={{ backgroundColor: '#A58D7F', color: 'white' }}>
                <th style={thStyle}>Nom</th>
                <th style={thStyle}>Prénom</th>
                <th style={thStyle}>Numéro Poste</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Groupe</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                  <td style={tdStyle}>{u.nom}</td>
                  <td style={tdStyle}>{u.prenom}</td>
                  <td style={tdStyle}>{u.numeroPoste}</td>
                  <td style={tdStyle}>{u.mail}</td>
                  <td style={tdStyle}>{u.groupe}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '20px' }}>
            <button
              onClick={exportToExcel}
              style={{
                marginRight: '10px',
                padding: '8px 15px',
                backgroundColor: '#0073A8',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Exporter Excel
            </button>

            <button
              onClick={exportToPDF}
              style={{
                padding: '8px 15px',
                backgroundColor: '#A58D7F',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Exporter PDF
            </button>
          </div>
        </div>
      ) : gatewayDetails && (
        <p style={{ color: 'gray', marginTop: '20px' }}>
          Aucun utilisateur trouvé pour ce groupe.
        </p>
      )}
    </div>
  );
}

const infoCardStyle = {
  backgroundColor: '#F3F3F3',
  padding: '12px 20px',
  borderRadius: '10px',
  minWidth: '150px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  color: '#003366',
  fontSize: '15px',
  textAlign: 'center',
  transition: 'transform 0.2s ease-in-out',
};

const thStyle = {
  padding: '10px',
  border: '1px solid #ccc',
  fontWeight: 'bold',
  fontSize: '16px',
};

const tdStyle = {
  padding: '10px',
  border: '1px solid #ccc',
  fontSize: '15px',
};

export default GatewayWithUsers;

import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const FactureList = () => {
  const [mois, setMois] = useState('');
  const [numeroPoste, setNumeroPoste] = useState('');
  const [factures, setFactures] = useState([]);
  const [listePostes, setListePostes] = useState([]);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3005/api/factures/postes')
      .then(res => res.json())
      .then(data => setListePostes(data))
      .catch(err => {
        console.error('Erreur chargement des postes:', err);
        setListePostes([]);
      });
  }, []);

  const rechercherFactures = async () => {
    if (!mois || !numeroPoste) {
      setErreur("Veuillez sélectionner un mois et un numéro de poste.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3005/api/factures/search?mois=${mois}&numeroPoste=${numeroPoste}`);
      if (!response.ok) throw new Error("Erreur serveur : " + response.statusText);

      const data = await response.json();
      setFactures(Array.isArray(data) ? data : []);
      setErreur(null);
    } catch (err) {
      console.error("Erreur récupération factures:", err);
      setErreur("Impossible de récupérer les factures.");
      setFactures([]);
    }
  };

  const exporterExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      factures.map(f => ({
        Nom: f.nom || '',
        Prénom: f.prenom || '',
        Mois: f.mois,
        Année: f.annee,
        Montant: f.montant_total,
        Date: new Date(f.date_generation).toLocaleDateString('fr-FR')
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Factures");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer], { type: "application/octet-stream" }), "factures.xlsx");
  };

  const exporterPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Liste des factures", 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [[
        'Nom', 'Prénom', 'Mois', 'Année', 'Montant', 'Date'
      ]],
      body: factures.map(f => [
        f.nom || '-', f.prenom || '-', f.mois, f.annee,
        f.montant_total,
        new Date(f.date_generation).toLocaleDateString('fr-FR')
      ]),
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [0, 51, 102] }
    });

    doc.save("factures.pdf");
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1100px', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center', color: '#003366' }}>🧾 Facturation</h2>

      <div style={{
        display: 'flex',
        gap: '15px',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '20px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <input
          type="month"
          onChange={(e) => {
            const [year, month] = e.target.value.split("-");
            setMois(parseInt(month));
          }}
          style={{
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '15px'
          }}
        />
        <select
          value={numeroPoste}
          onChange={(e) => setNumeroPoste(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '6px',
            fontSize: '15px',
            border: '1px solid #ccc'
          }}
        >
          <option value="">-- Sélectionner poste --</option>
          {listePostes.map(poste => (
            <option key={poste} value={poste}>{poste}</option>
          ))}
        </select>
        <button
          onClick={rechercherFactures}
          style={{
            padding: '8px 16px',
            backgroundColor: '#0073A8',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔍 Rechercher
        </button>
      </div>

      {erreur && (
        <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{erreur}</p>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '20px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#A58D7F', color: 'white' }}>
              <th style={thStyle}>NOM</th>
              <th style={thStyle}>PRÉNOM</th>
              <th style={thStyle}>MOIS</th>
              <th style={thStyle}>ANNÉE</th>
              <th style={thStyle}>MONTANT</th>
              <th style={thStyle}>DATE</th>
            </tr>
          </thead>
          <tbody>
            {factures.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '15px', color: '#555' }}>
                  Aucune facture trouvée
                </td>
              </tr>
            ) : (
              factures.map((facture, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                  <td style={tdStyle}>{facture.nom || '-'}</td>
                  <td style={tdStyle}>{facture.prenom || '-'}</td>
                  <td style={tdStyle}>{facture.mois}</td>
                  <td style={tdStyle}>{facture.annee}</td>
                  <td style={tdStyle}>{facture.montant_total}</td>
                  <td style={tdStyle}>{new Date(facture.date_generation).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {factures.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '15px',
          marginTop: '25px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={exporterExcel}
            style={{
              padding: '8px 16px',
              backgroundColor: '#A58D7F',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ⬇️ Export Excel
          </button>
          <button
            onClick={exporterPDF}
            style={{
              padding: '8px 16px',
              backgroundColor: '#003366',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🧾 Export PDF
          </button>
        </div>
      )}
    </div>
  );
};

const thStyle = {
  padding: '10px',
  border: '1px solid #ccc',
  fontSize: '15px'
};

const tdStyle = {
  padding: '10px',
  border: '1px solid #ddd',
  fontSize: '14px',
  textAlign: 'center'
};

export default FactureList;

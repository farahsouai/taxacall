import React, { useState, useEffect } from "react";
import "./UtilisateursParGroupe.css";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const UtilisateurPoulinaSearch = () => {
  const [numeroPoste, setNumeroPoste] = useState('');
  const [utilisateur, setUtilisateur] = useState(null);
  const [error, setError] = useState('');
  const [listeUtilisateurs, setListeUtilisateurs] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3005/api/utilisateurs-poulina")
      .then(res => res.json())
      .then(data => {
        console.log("📦 Utilisateurs chargés :", data);
        setListeUtilisateurs(data);
      })
      .catch(err => console.error("Erreur chargement liste utilisateurs:", err));
  }, []);
  

  const rechercher = async () => {
    try {
      const res = await fetch(`http://localhost:3005/api/utilisateurs-poulina/${numeroPoste}`);
      const data = await res.json();
      setUtilisateur(data);
      setError('');
    } catch (err) {
      setUtilisateur(null);
      setError(err.message);
    }
  };

  const exporterExcel = () => {
    if (!utilisateur) return;

    const ws = XLSX.utils.json_to_sheet([utilisateur]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Utilisateur");

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(fileData, `Utilisateur_${utilisateur.numeroPoste || 'resultat'}.xlsx`);
  };

  const exporterPDF = () => {
    if (!utilisateur) return;

    const doc = new jsPDF();
    doc.text("Fiche Utilisateur Poulina", 14, 20);
    doc.autoTable({
      startY: 30,
      head: [["Nom", "Prénom", "Mail", "Groupe"]],
      body: [[
        utilisateur.nom || '',
        utilisateur.prenom || '',
        utilisateur.mail || '',
        utilisateur.groupe || ''
      ]]
    });

    doc.save(`Utilisateur_${utilisateur.numeroPoste || 'fiche'}.pdf`);
  };

  return (
    <div className="utilisateur-container">
      <h2>👤 Recherche Utilisateur Poulina</h2>
      <div className="input-section">
        <select value={numeroPoste} onChange={(e) => setNumeroPoste(e.target.value)}>
          <option value="">-- Sélectionner un numéro de poste --</option>
          {listeUtilisateurs.map((u, i) => (
            <option key={i} value={u.numeroPoste}>
              {u.numeroPoste}
            </option>
          ))}
        </select>
        <button onClick={rechercher}>🔍 Rechercher</button>
      </div>

      {utilisateur && (
        <>
          <table className="utilisateur-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Mail</th>
                <th>Groupe</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{utilisateur.nom}</td>
                <td>{utilisateur.prenom}</td>
                <td>{utilisateur.mail}</td>
                <td>{utilisateur.groupe}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: '15px' }}>
            <button onClick={exporterExcel} style={{ marginRight: '10px' }}>
              📥 Exporter en Excel
            </button>
            <button onClick={exporterPDF}>
              🧾 Exporter en PDF
            </button>
          </div>
        </>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default UtilisateurPoulinaSearch;

import React, { useEffect, useState } from 'react';
import './FactureListe.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { exportFacturesToExcel } from '../helpers/exportToExcel';

const FactureList = () => {
  const [factures, setFactures] = useState([]);
  const [mois, setMois] = useState('');
  const [nom, setNom] = useState('');
  const [numeroPoste, setNumeroPoste] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchFactures = async () => {
    try {
      const moisNum = mois ? parseInt(mois.split("-")[1], 10) : "";

      const res = await fetch(`http://localhost:3001/api/factures/search?mois=${moisNum}&nom=${nom}&numeroPoste=${numeroPoste}`);
      const data = await res.json();
      setFactures(data);
    } catch (error) {
      console.error("❌ Erreur récupération factures:", error);
    }
  };

  useEffect(() => {
    fetchFactures();
  }, []);

  const handleSort = (field) => {
    const order = (field === sortField && sortOrder === 'asc') ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);
  };

  const sortedFactures = [...factures].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (typeof aVal === 'string') {
      return sortOrder === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    } else {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
  });

  const exportToCSV = (rows) => {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(","),
      ...rows.map(row => headers.map(h => `"${row[h]}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "factures.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = (rows) => {
    const doc = new jsPDF();
    doc.text("Liste des Factures", 14, 16);
    const tableColumn = ["Nom", "Prénom",  "Mois", "Année", "Montant", "Format", "Date"];
    const tableRows = [];
    rows.forEach(f => {
      tableRows.push([
        f.nom,
        f.prenom,
        
        f.mois,
        f.annee,
        `${f.montant_total} DT`,
        f.format.toUpperCase(),
        new Date(f.date_generation).toLocaleString()
      ]);
    });
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 22 });
    doc.save("factures.pdf");
  };

  return (
    <div className="facture-container">
      <h2>📄 Facturation</h2>

      <div className="filters">
        <input type="month" value={mois} onChange={e => setMois(e.target.value)} placeholder="Mois" />
        <input type="text" placeholder="Numéro de poste" value={numeroPoste} onChange={(e) => setNumeroPoste(e.target.value)} />
        
        <button onClick={fetchFactures}>🔍 Rechercher</button>
      </div>

      <div className="export-buttons">
        <button className="export-button pdf" onClick={() => exportToPDF(sortedFactures)}>🖨️ Exporter en PDF</button>
        <button className="export-button excel" onClick={() => exportFacturesToExcel(factures)}>📥 Exporter en Excel</button>
      </div>

      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('nom')}>Nom</th>
            <th onClick={() => handleSort('prenom')}>Prénom</th>
           
            <th onClick={() => handleSort('mois')}>Mois</th>
            <th onClick={() => handleSort('annee')}>Année</th>
            <th onClick={() => handleSort('montant_total')}>Montant</th>
            <th onClick={() => handleSort('format')}>Format</th>
            <th onClick={() => handleSort('date_generation')}>Date</th>
          </tr>
        </thead>
        <tbody>
          {sortedFactures.length > 0 ? sortedFactures.map((f, i) => (
            <tr key={i}>
              <td>{f.nom}</td>
              <td>{f.prenom}</td>
            
              <td>{f.mois}</td>
              <td>{f.annee}</td>
              <td>{f.montant_total} DT</td>
              <td className={`format-label ${f.format}`}>{f.format.toUpperCase()}</td>
              <td>{new Date(f.date_generation).toLocaleString()}</td>
            </tr>
          )) : (
            <tr><td colSpan="8">Aucune facture trouvée</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FactureList;

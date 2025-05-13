import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import './AlerteDepassement.css';

const AlerteDepassement = () => {
  const [alertes, setAlertes] = useState([]);
  const [searchPoste, setSearchPoste] = useState('');
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAlertes();
    fetchUtilisateurs();
  }, []);

  const fetchAlertes = async () => {
    try {
      const res = await fetch('http://localhost:3005/api/alertes');
      const data = await res.json();
      setAlertes(data);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des alertes :', error);
    }
  };

  const fetchUtilisateurs = async () => {
    try {
      const res = await fetch('http://localhost:3005/api/alertes/numeros-poste');
      const data = await res.json();
      setUtilisateurs(data); // Chaque item contient un "numeroPoste"
    } catch (error) {
      console.error('❌ Erreur chargement numéros :', error);
    }
  };
  
  const alertesFiltrees = searchPoste
    ? alertes.filter((a) =>
        a.numeroPoste.toLowerCase().includes(searchPoste.toLowerCase())
      )
    : alertes;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = alertesFiltrees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(alertesFiltrees.length / itemsPerPage);

  const handleExportPDF = () => {
    const element = document.getElementById('alerte-table-wrapper');
    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`alertes-depassement.pdf`);
    });
  };

  const handleExportExcel = () => {
    const sheetData = [
      ['Nom', 'Prénom', 'Numéro Poste', 'Coût', 'Seuil', 'Date'],
      ...alertesFiltrees.map((a) => [
        a.nom,
        a.prenom,
        a.numeroPoste,
        a.cout,
        a.seuil,
        new Date(a.date).toLocaleString(),
      ]),
    ];
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, sheet, 'Alertes');
    XLSX.writeFile(workbook, 'alertes-depassement.xlsx');
  };

  const imprimer = () => {
    const contenu = document.getElementById('alerte-table-wrapper').innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Impression</title>
      <style>table { width: 100%; border-collapse: collapse; font-family: sans-serif; }
      th, td { border: 1px solid #000; padding: 8px; text-align: center; }</style>
      </head><body>${contenu}</body></html>
    `);
    win.document.close();
    win.print();
  };

  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 10;
    let start = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let end = Math.min(start + maxPagesToShow - 1, totalPages);

    if (end - start < maxPagesToShow - 1) {
      start = Math.max(1, end - maxPagesToShow + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={i === currentPage ? 'active' : ''}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination-container">
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
          ⬅️ Précédent
        </button>
        {pages}
        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
          Suivant ➡️
        </button>
      </div>
    );
  };

  return (
    <div className="alerte-container">
      <h2>🚨 Alertes de dépassement de seuil</h2>

      <div className="filtre-numero-poste">
        <select
          value={searchPoste}
          onChange={(e) => {
            setSearchPoste(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">-- Sélectionner un numéro de poste --</option>
         {alertes.map((u, idx) => (
  <option key={`${u.numeroPoste}-${idx}`} value={u.numeroPoste}>
    {u.numeroPoste}
  </option>
))}

        </select>
      </div>

      <div className="alerte-actions">
        <button onClick={handleExportExcel}>📊 Exporter Excel</button>
        <button onClick={handleExportPDF}>📄 Exporter PDF</button>
        <button onClick={imprimer}>🖨️ Imprimer</button>
      </div>

      <div id="alerte-table-wrapper">
        <table className="alerte-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Numéro Poste</th>
              <th>Coût</th>
              <th>Seuil</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((a, idx) => (
                <tr key={`${a.numeroPoste}-${a.date}-${idx}`}>
                  <td>{a.nom}</td>
                  <td>{a.prenom}</td>
                  <td>{a.numeroPoste}</td>
                  <td>{a.cout} DT</td>
                  <td>{a.seuil} DT</td>
                  <td>{new Date(a.date).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">Aucune alerte trouvée</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && renderPagination()}
    </div>
  );
};

export default AlerteDepassement;

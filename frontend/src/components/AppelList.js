import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import './AppelList.css';

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const couleurPalette = ['#0073A8', '#FF9F40', '#4BC0C0', '#9966FF', '#FF6384', '#36A2EB'];

const AppelList = () => {
  const [appels, setAppels] = useState([]);
  const [numeroPoste, setNumeroPoste] = useState(null);
  const [postesDispo, setPostesDispo] = useState([]);
  const [nombreAppels, setNombreAppels] = useState(0);
  const [dureeTotale, setDureeTotale] = useState('00:00:00');
  const [coutTotal, setCoutTotal] = useState(0);
  const [graphData, setGraphData] = useState({ labels: [], data: [] });
  const [graphMois, setGraphMois] = useState({ labels: [], data: [] });
  const [afficherTableau, setAfficherTableau] = useState(true);
  const [dateDebut, setDateDebut] = useState('');

  useEffect(() => {
    fetch('http://localhost:3005/api/appelliste/numero-postes')
      .then(res => res.json())
      .then(data => {
        const options = data.map(p => ({ value: p, label: p }));
        setPostesDispo(options);
      })
      .catch(err => console.error('❌ Erreur chargement des numéros de poste :', err));
  }, []);

  const formatDuree = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const fetchAppels = async (poste) => {
    if (!poste) return;
    try {
      const res = await fetch(`http://localhost:3005/api/appelliste/by-poste/${poste}`);
      let data = await res.json();

      if (dateDebut) {
        data = data.filter(appel => new Date(appel.date_appel) >= new Date(dateDebut));
      }

      setAppels(data);
      setNombreAppels(data.length);

      const totalSeconds = data.reduce((acc, appel) => acc + Number(appel.duree || 0), 0);
      setDureeTotale(formatDuree(totalSeconds));

      const totalCout = data.reduce((acc, appel) => acc + parseFloat(appel.cout || 0), 0);
      setCoutTotal(totalCout.toFixed(3));

      const parJour = {};
      const parMois = {};
      data.forEach(appel => {
        const jour = appel.date_appel.split('T')[0];
        parJour[jour] = (parJour[jour] || 0) + 1;
        const mois = appel.date_appel.substring(0, 7);
        parMois[mois] = (parMois[mois] || 0) + 1;
      });
      const labelsJ = Object.keys(parJour).sort();
      const valuesJ = labelsJ.map(l => parJour[l]);
      const labelsM = Object.keys(parMois).sort();
      const valuesM = labelsM.map(l => parMois[l]);

      setGraphData({ labels: labelsJ, data: valuesJ });
      setGraphMois({ labels: labelsM, data: valuesM });

    } catch (err) {
      console.error('Erreur de récupération des appels :', err);
    }
  };

  const exporterPDF = () => {
    const element = document.getElementById('appel-table-wrapper');
    html2canvas(element).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`statistiques-appels-${numeroPoste?.value || ''}.pdf`);
    });
  };

  const exporterExcel = () => {
    const workbook = XLSX.utils.book_new();
    const sheetData = [
      ["Numéro de poste", "Nombre d'appels", "Durée totale", "Coût total (DT)"],
      [numeroPoste?.value || "?", nombreAppels, dureeTotale, coutTotal]
    ];
    const sheet = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, sheet, "Statistiques");
    XLSX.writeFile(workbook, `statistiques-${numeroPoste?.value || 'poste'}.xlsx`);
  };

  const imprimerTableau = () => {
    const contenu = document.getElementById('appel-table-wrapper').innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Impression du tableau</title>
      <style>table { width: 100%; border-collapse: collapse; font-family: sans-serif; }
      th, td { border: 1px solid #000; padding: 8px; text-align: center; }</style>
      </head><body>${contenu}</body></html>
    `);
    win.document.close();
    win.print();
    // Attendre que le contenu soit bien chargé
  win.onload = () => {
    win.focus(); // s'assurer que la fenêtre est active
    win.print();
    win.close(); // fermer la fenêtre après impression
  };
};
  

  return (
    <div className="appel-container">
      <h2>📞 Liste des Appels</h2>

      <div className="appel-filters">
        <Select
          options={postesDispo}
          placeholder="🔎 Rechercher un numéro de poste..."
          value={numeroPoste || null}
          onChange={(selected) => {
            setNumeroPoste(selected);
            if (selected) fetchAppels(selected.value);
          }}
          isClearable
        />

        <input
          type="date"
          value={dateDebut}
          onChange={(e) => {
            setDateDebut(e.target.value);
            if (numeroPoste) fetchAppels(numeroPoste.value);
          }}
          className="appel-date-filter"
        />
      </div>

      {appels.length > 0 && (
        <>
          {afficherTableau && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <button onClick={imprimerTableau} className="appel-export-btn">🖨️ Imprimer le tableau</button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
            <button onClick={() => setAfficherTableau(prev => !prev)} className="appel-export-btn">
              {afficherTableau ? '👁️ Masquer le tableau' : '👁️ Afficher le tableau'}
            </button>
          </div>

          {afficherTableau && (
            <div id="appel-table-wrapper">
              <table className="appel-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Durée</th>
                    <th>Opérateur</th>
                    <th>Coût</th>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Filiale</th>
                  </tr>
                </thead>
                <tbody>
                  {appels.map((appel, idx) => (
                    <tr key={idx}>
                      <td>{appel.date_appel}</td>
                      <td>{formatDuree(Number(appel.duree || 0))}</td>
                      <td>{appel.operateur}</td>
                      <td>{appel.cout}</td>
                      <td>{appel.nom}</td>
                      <td>{appel.prenom}</td>
                      <td>{appel.filiale}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                    <td colSpan="1">📊 Totaux :</td>
                    <td>{dureeTotale}</td>
                    <td>—</td>
                    <td>{coutTotal} DT</td>
                    <td colSpan="3">📞 {nombreAppels} appels</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          <div className="appel-chart">
            <h4>📆 Nombre d'appels chaque jour (Total : {nombreAppels})</h4>
            <Bar
              data={{
                labels: graphData.labels,
                datasets: [{
                  label: 'Nombre d’appels',
                  data: graphData.data,
                  backgroundColor: graphData.labels.map((_, i) => couleurPalette[i % couleurPalette.length])
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: true },
                  tooltip: {
                    callbacks: {
                      title: ctx => `📅 ${ctx[0].label}`,
                      label: ctx => `📞 ${ctx.raw} appels`
                    }
                  }
                },
                scales: {
                  y: { beginAtZero: true, ticks: { precision: 0 } }
                }
              }}
            />
          </div>

          <div className="appel-chart">
            <h4>📅 Répartition mensuelle des appels</h4>
            <Pie
              data={{
                labels: graphMois.labels,
                datasets: [{
                  data: graphMois.data,
                  backgroundColor: graphMois.labels.map((_, i) => couleurPalette[i % couleurPalette.length])
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: true },
                  tooltip: {
                    callbacks: {
                      label: ctx => `${ctx.label} : ${ctx.raw} appels`
                    }
                  }
                }
              }}
            />
          </div>
        </>
      )}

      {appels.length === 0 && (
        <p className="appel-empty">Aucun appel trouvé</p>
      )}
    </div>
  );
};

export default AppelList;

import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import './Dashboard.css';

const DashboardHistoriqueMensuel = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3005/api/statistiques/historique-mensuel")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => {
        console.error("❌ Erreur chargement données mensuelles :", err);
        setData([]);
      });
  }, []);

  const options = {
    chart: {
      type: 'line',
      height: 400,
      zoom: { enabled: false },
      toolbar: { show: false }
    },
    title: {
      text: '📅 Consommation mensuelle cumulée',
      align: 'center',
      style: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#2c3e50'
      }
    },
    xaxis: {
      categories: data.map((d) => `${d.mois}/${d.annee}`),
      title: {
        text: 'Mois',
        style: { fontSize: '14px' }
      }
    },
    yaxis: {
      title: {
        text: 'Montant total (DT)',
        style: { fontSize: '14px' }
      },
      labels: {
        formatter: (val) => `${val.toFixed(2)} DT`
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    dataLabels: {
      enabled: true
    },
    markers: {
      size: 5,
      colors: ['#FF9800']
    },
    colors: ['#FF9800'],
    grid: {
      borderColor: '#eee',
      row: {
        colors: ['#f9f9f9', 'transparent']
      }
    },
    tooltip: {
      y: {
        formatter: (val) => `${val.toFixed(2)} DT`
      }
    }
  };

  const series = [{
    name: 'Consommation',
    data: data.map((d) => d.total)
  }];

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: 'auto' }}>
      {data.length === 0 ? (
        <div style={{
          background: '#f4f6f8',
          textAlign: 'center',
          padding: '30px',
          borderRadius: '10px',
          color: '#555',
          fontWeight: '500'
        }}>
          Pas encore de données mensuelles disponibles.
        </div>
      ) : (
        <>
          <Chart options={options} series={series} type="line" height={400} />
          <p style={{ textAlign: 'center', marginTop: '15px', color: '#333' }}>
            Ce graphique affiche la consommation totale mensuelle agrégée (toutes filiales confondues).
          </p>
        </>
      )}
    </div>
  );
};

export default DashboardHistoriqueMensuel;

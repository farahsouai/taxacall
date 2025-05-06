import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import "./Dashboard.css";

const DashboardAppels = () => {
    const [data, setData] = useState({ total: 0, entrants: 0, sortants: 0 });
    const [selectedDate, setSelectedDate] = useState(getToday());
  
    function getToday() {
      return new Date().toISOString().split('T')[0];
    }
  
    useEffect(() => {
        fetch(`http://localhost:3005/api/statistiques-appels?date=${selectedDate}`)
          .then(res => res.json())
          .then(res => {
            const entrants = Number(res.entrants) || 0;
            const sortants = Number(res.sortants) || 0;
            console.log('📊 Données reçues :', { entrants, sortants });
            setData({ entrants, sortants, total: entrants + sortants });
          })
          .catch(err => console.error("Erreur API appels :", err));
      }, [selectedDate]);
      
    const series = [data.entrants, data.sortants];
  
    const options = {
      chart: { type: 'donut' },
      labels: ['Entrants', 'Sortants'],
      colors: ['#00C292', '#F62D51'],
      title: {
        text: '📞 Répartition des appels',
        align: 'center'
      },
      dataLabels: {
        formatter: function (val, opts) {
          const index = opts.seriesIndex;
          const count = series[index];
          const percentage = ((count / (data.total || 1)) * 100).toFixed(1);
          return `${count} appels (${percentage}%)`;
        }
      },
      legend: {
        position: 'bottom'
      },
      tooltip: {
        y: {
          formatter: function (value, { seriesIndex }) {
            const percentage = ((value / (data.total || 1)) * 100).toFixed(1);
            return `${value} appels (${percentage}%)`;
          }
        }
      }
    };
  
    return (
      <div className="dashboard-card">
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />
        </div>
  
        {data.total === 0 ? (
          <p style={{ textAlign: 'center' }}>Aucune donnée disponible pour cette date.</p>
        ) : (
          <>
            <Chart options={options} series={series} type="donut" width="300" />
            <p style={{ textAlign: 'center' }}>
              📊 Total appels : <strong>{data.total}</strong>
            </p>
          </>
        )}
      </div>
    );
  };
  
  export default DashboardAppels;
  
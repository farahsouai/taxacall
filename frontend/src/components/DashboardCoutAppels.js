import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';

const DashboardCoutAppels = () => {
  const [data, setData] = useState({ total: 0, moyenne: 0, top: [] });
  const [selectedDate, setSelectedDate] = useState(getToday());

  function getToday() {
    return new Date().toISOString().split('T')[0];
  }

  useEffect(() => {
    fetch(`http://localhost:3005/api/statistiques-cout-appels?date=${selectedDate}`)
      .then(res => res.json())
      .then(setData)
      .catch(err => {
        console.error("Erreur coûts :", err);
        setData({ total: 0, moyenne: 0, top: [] });
      });
  }, [selectedDate]);

  const options = {
    chart: { type: 'bar' },
    title: {
      text: 'Top 5 appels les plus chers',
      align: 'center'
    },
    xaxis: {
      categories: data.top.map((item, index) => 
        `${item.nom || '---'} (${item.heure || '---'})`
      ),
      labels: { rotate: -45 }
    },
    tooltip: {
      y: {
        formatter: (val) => `${val.toFixed(2)} DT`
      }
    },
    colors: ['#FFA726']
  };

  const series = [{
    name: 'Coût (DT)',
    data: data.top.map(item => item.cout)
  }];

  return (
    <div className="dashboard-card">
      <div style={{ marginBottom: '1rem' }}>
        <label> </label>
        <input 
          type="date" 
          value={selectedDate} 
          onChange={e => setSelectedDate(e.target.value)} 
        />
      </div>

      {data.top.length > 0 ? (
        <Chart options={options} series={series} type="bar" height={320} />
      ) : (
        <p>Aucune donnée disponible pour cette date.</p>
      )}

<p>💰 Total : <strong>{Number(data.total).toFixed(2)} DT</strong></p>


    </div>
  );
};

export default DashboardCoutAppels;

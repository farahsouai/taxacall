const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔁 Route stats temps réel
router.get('/realtime', (req, res) => {
  const query = `
    SELECT 
      COUNT(*) AS totalAppels,
      SUM(CASE WHEN direction = 'entrant' THEN 1 ELSE 0 END) AS appelsEntrants,
      SUM(CASE WHEN direction = 'sortant' THEN 1 ELSE 0 END) AS appelsSortants,
      SEC_TO_TIME(SUM(TIME_TO_SEC(duree))) AS dureeTotale,
      ROUND(SUM(cout), 3) AS coutTotal
    FROM appels
    WHERE DATE(date_appel) = CURDATE()
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Erreur récupération stats temps réel :', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    const data = results[0] || {};
    res.json({
      totalAppels: data.totalAppels || 0,
      appelsEntrants: data.appelsEntrants || 0,
      appelsSortants: data.appelsSortants || 0,
      dureeTotale: data.dureeTotale || '00:00:00',
      coutTotal: data.coutTotal || 0
    });
  });
});

// 📊 Stats temps réel **par poste** (top 20)
router.get('/realtime-par-poste', (req, res) => {
    const query = `
      SELECT 
        numeroPoste,
        COUNT(*) AS totalAppels,
        SUM(direction = 'entrant') AS appelsEntrants,
        SUM(direction = 'sortant') AS appelsSortants,
        SEC_TO_TIME(SUM(TIME_TO_SEC(duree))) AS dureeTotale,
        ROUND(SUM(cout), 3) AS coutTotal
      FROM appels
      WHERE DATE(date_appel) = CURDATE()
      GROUP BY numeroPoste
      ORDER BY totalAppels DESC
      LIMIT 20
    `;
    db.query(query, (err, results) => {
      if (err) {
        console.error('❌ Erreur récupération stats par poste :', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.json(results);
    });
  });
  
module.exports = router;

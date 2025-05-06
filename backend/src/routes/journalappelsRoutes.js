const express = require('express');
const router = express.Router();
const db = require('../db'); // tu gardes ton db.js actuel

router.get('/journal-appels', (req, res) => {
  const query = `
  SELECT 
    DATE_FORMAT(date_appel, '%d/%m/%Y') AS date,
    TIME_FORMAT(date_appel, '%H:%i:%s') AS heure,
    numeroPoste AS numero,
    CONCAT(prenom, ' ', nom) AS nom,
    duree,
    CASE 
      WHEN LOWER(direction_appel) = 'entrant' THEN 'entrant'
      WHEN LOWER(direction_appel) = 'sortant' THEN 'sortant'
      ELSE NULL
    END AS type
  FROM appels
  ORDER BY date_appel DESC, heure DESC
`;


  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Erreur journal-appels :", err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(results);
  });
});

module.exports = router;

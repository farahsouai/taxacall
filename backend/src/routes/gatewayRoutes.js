const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔍 Rechercher une passerelle par IP
router.get('/:ip', (req, res) => {
  const { ip } = req.params;
  const sql = 'SELECT * FROM gateways WHERE ip = ?';
  db.query(sql, [ip], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    if (result.length === 0) return res.status(404).json({ error: 'IP non trouvée' });
    res.json(result[0]);
  });
});

router.get('/', (req, res) => {
  db.query('SELECT * FROM gateways', (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(result);
  });
});


module.exports = router;

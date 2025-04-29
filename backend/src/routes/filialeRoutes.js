const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ Route : GET /api/filiales
// Renvoie la liste complète des filiales
router.get('/', (req, res) => {
  const sql = `SELECT * FROM filiales`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Erreur récupération filiales :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    res.json(result);
  });
});

// ✅ Route : GET /api/filiales/by-device-pool/:devicePool
// Renvoie la filiale correspondant à un device pool
router.get('/by-device-pool/:devicePool', (req, res) => {
  const pool = req.params.devicePool;

  const sql = `SELECT * FROM filiales WHERE device_pool = ? LIMIT 1`;
  db.query(sql, [pool], (err, results) => {
    if (err) {
      console.error("❌ Erreur recherche par device_pool :", err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Aucune filiale trouvée' });
    }

    res.json(results[0]);
  });
});

module.exports = router;

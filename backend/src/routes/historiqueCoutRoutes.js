const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔹 GET /api/historique-cout?mois=6&numeroPoste=123456
router.get('/historique-cout', (req, res) => {
  const { mois, numeroPoste } = req.query;

  if (!mois || !numeroPoste) {
    return res.status(400).json({ error: "Paramètres manquants" });
  }

  const sql = `
    SELECT mois, numeroPoste AS utilisateur_id, total
    FROM historique_cout
    WHERE mois = ? AND numeroPoste = ?
  `;

  db.query(sql, [mois, numeroPoste], (err, results) => {
    if (err) {
      console.error("❌ Erreur requête :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    res.json(results);
  });
});

// 🔹 GET /api/utilisateurs => pour la liste des numéros de poste
router.get('/utilisateurs', (req, res) => {
  const sql = `SELECT DISTINCT numeroPoste FROM historique_cout ORDER BY numeroPoste`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Erreur chargement utilisateurs :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    res.json(results);
  });
});

module.exports = router;


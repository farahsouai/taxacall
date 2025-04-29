const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ 1. Liste des numéros de poste depuis la table appels
router.get('/numero-postes', (req, res) => {
  const sql = `
    SELECT DISTINCT numeroPoste
    FROM appels
    WHERE 
      numeroPoste IS NOT NULL
      AND numeroPoste != ''
      AND numeroPoste REGEXP '^[0-9]{4,}$' -- uniquement des chiffres (4 chiffres ou +)
    ORDER BY numeroPoste ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Erreur récupération numéros de poste :", err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    const postes = results.map(r => r.numeroPoste);
    res.json(postes);
  });
});


// ✅ 2. Liste des appels pour un poste donné
router.get('/by-poste/:numero', (req, res) => {
  const { numero } = req.params;

  const sql = `
    SELECT a.*, u.nom, u.prenom, u.groupe AS filiale
    FROM appels a
    LEFT JOIN utilisateurs_poulina u ON a.numeroPoste = u.numeroPoste
    WHERE a.numeroPoste = ?
    ORDER BY a.date_appel DESC
  `;

  db.query(sql, [numero], (err, results) => {
    if (err) {
      console.error("❌ Erreur récupération appels :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    res.json(results);
  });
});

module.exports = router;

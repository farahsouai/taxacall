const express = require("express");
const router = express.Router();
const db = require("../db");

// 🔍 Rechercher les factures par mois et numéro de poste
router.get('/search', (req, res) => {
  const { mois, numeroPoste } = req.query;

  if (!mois || !numeroPoste) {
    return res.status(400).json({ error: 'Paramètres requis manquants' });
  }

  const query = `
    SELECT * FROM factures 
    WHERE mois = ? AND numeroPoste = ?
  `;

  db.query(query, [parseInt(mois), numeroPoste], (err, results) => {
    if (err) {
      console.error("❌ Erreur SQL :", err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(results);
  });
});

// ✅ Route pour récupérer toutes les factures avec nom/prénom utilisateur
router.get("/", (req, res) => {
  const query = `
    SELECT f.id, f.numeroPoste, f.mois, f.annee, f.montant_total, f.format, f.date_generation,
           f.nom, f.prenom
    FROM factures f
    ORDER BY f.annee DESC, f.mois DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Erreur récupération des factures :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json(results);
  });
});

// ✅ Récupérer tous les numéros de poste depuis la table utilisateurs
router.get('/postes', (req, res) => {
  const sql = 'SELECT DISTINCT numeroPoste FROM factures ORDER BY numeroPoste';
  const db = require('../db'); // assure-toi que db est bien importé

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Erreur récupération des numéros de poste :", err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(results.map(row => row.numeroPoste));
  });
});


module.exports = router;


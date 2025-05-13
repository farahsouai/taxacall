const express = require('express');
const router = express.Router();
const Alerte = require('../model/alerte');

// Insérer une alerte si dépassement
router.post('/verifier', (req, res) => {
  const { numeroPoste, cout, seuil } = req.body;
  Alerte.checkAndInsertAlerte(numeroPoste, cout, seuil, (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    res.json(result);
  });
});

// Lister toutes les alertes
router.get('/', (req, res) => {
  Alerte.getAllAlertes((err, results) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    res.json(results);
  });
});

// Importer les utilisateurs poulina comme alertes (en dur pour test)
router.post('/import-utilisateurs', (req, res) => {
  const seuil = 100.0;
  const cout = 120.0;
  Alerte.importDepuisUtilisateursPoulina(seuil, cout, (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur lors de l’import' });
    res.json({ message: 'Import effectué avec succès', result });
  });
});

// Route : GET /api/utilisateurs
router.get('/', (req, res) => {
  db.query('SELECT numeroPoste FROM utilisateurs_poulina', (err, results) => {
    if (err) {
      console.error('❌ Erreur récupération utilisateurs_poulina :', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(results);
  });
});

// ➤ Route pour récupérer tous les numéros de poste présents dans les alertes
router.get('/numeros-poste', (req, res) => {
  const sql = 'SELECT DISTINCT numeroPoste FROM alertes ORDER BY numeroPoste';
  const db = require('../db');

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Erreur récupération numéros :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    res.json(results);
  });
});

module.exports = router;

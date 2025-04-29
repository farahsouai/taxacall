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

module.exports = router;

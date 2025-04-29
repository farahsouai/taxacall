const express = require('express');
const Appel = require('../model/appel');
const router = express.Router();
const db = require('../db');

// ✅ Route pour récupérer tous les appels avec filtres
router.get('/filter', (req, res) => {
  Appel.findWithFilters(req.query, (err, appels) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur', details: err });
    res.status(200).json(appels);
  });
});

// ✅ Appels nationaux
router.get('/nationaux', (req, res) => {
  Appel.findNationaux((err, results) => {
    if (err) return res.status(500).json({ error: "Erreur appels nationaux" });
    res.json(results);
  });
});

// ✅ Appels internationaux par numéro de poste
router.get('/internationaux/:numeroPoste', (req, res) => {
  const numeroPoste = req.params.numeroPoste;

  const sql = `
    SELECT dateAppel, numero, operateur, pays, duree, cout, filiale 
    FROM appelsInternationaux 
    WHERE numeroPoste = ?
  `;

  db.query(sql, [numeroPoste], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(result);
  });
});

// ✅ Appels inter-filiales
router.get('/filtrer-inter-filiale', (req, res) => {
  const { filiale_id } = req.query;

  if (!filiale_id) {
    return res.status(400).json({ error: "L'ID de la filiale est requis" });
  }

  const sql = `
    SELECT a.*, f.nom AS nom_filiale
    FROM appels a
    JOIN filiales f ON a.filiale_id = f.id
    WHERE a.filiale_id = ?
  `;

  db.query(sql, [filiale_id], (err, appels) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    res.status(200).json(appels);
  });
});

// ✅ Consommation du dernier mois dispo pour un numeroPoste
router.get('/consommation/:numeroPoste', (req, res) => {
  const numeroPoste = req.params.numeroPoste;

  const sql = `
    SELECT mois, annee 
    FROM appels 
    WHERE numeroPoste = ? 
    ORDER BY annee DESC, mois DESC 
    LIMIT 1
  `;

  db.query(sql, [numeroPoste], (err, dateResult) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });

    if (dateResult.length === 0) {
      return res.status(404).json({ error: "Aucune consommation trouvée pour ce poste" });
    }

    const { mois, annee } = dateResult[0];
    console.log("📅 Dernière date trouvée pour consommation :", dateResult[0]);


    const consoQuery = `
      SELECT SUM(cout) AS consommation 
      FROM appels 
      WHERE numeroPoste = ? AND mois = ? AND annee = ?
    `;

    db.query(consoQuery, [numeroPoste, mois, annee], (err, result) => {
      console.log(`🔍 Recherche consommation pour ${numeroPoste} - ${mois}/${annee}`);

      if (err) return res.status(500).json({ error: "Erreur serveur" });

      const consommation = result[0].consommation ?? 0;
      res.json({ consommation, mois, annee });
    });
  });
});

module.exports = router;

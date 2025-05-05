const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔹 Liste toutes les IP disponibles
router.get('/', (req, res) => {
  db.query('SELECT ip FROM gateways', (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(result);
  });
});

// 🔹 Détail d'une gateway + utilisateurs du groupe
router.get('/:ip', (req, res) => {
  const { ip } = req.params;

  const sqlGateway = 'SELECT * FROM gateways WHERE ip = ?';
  db.query(sqlGateway, [ip], (err, gatewayResults) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur (gateway)' });

    if (gatewayResults.length === 0) {
      return res.status(404).json({ message: 'Gateway non trouvée' });
    }

    const gateway = gatewayResults[0];

    const sqlUsers = 'SELECT nom, prenom, numeroPoste, mail, groupe FROM utilisateurs_poulina WHERE groupe = ?';
    db.query(sqlUsers, [gateway.groupe], (err, userResults) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur (utilisateurs)' });

      // 🔎 Envoie le tout en une seule réponse
      res.json({
        description: gateway.description,
        code: gateway.code,
        groupe: gateway.groupe,
        utilisateurs: userResults
      });
    });
  });
});

module.exports = router;

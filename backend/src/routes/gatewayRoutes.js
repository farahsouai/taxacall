const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔹 D'abord la route spécifique par numéro de poste
router.get('/par-poste/:numeroPoste', (req, res) => {
  const { numeroPoste } = req.params;
  const sql = `
    SELECT g.*
    FROM gateways g
    JOIN utilisateurs_poulina u ON g.ip = u.ip
    WHERE u.numeroPoste = ?
  `;

  db.query(sql, [numeroPoste], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    if (result.length === 0) return res.status(404).json({ error: 'Aucune passerelle trouvée' });
    res.json(result);
  });
});

// 🔹 Ensuite les routes plus générales
router.get('/', (req, res) => {
  db.query('SELECT ip FROM gateways', (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(result);
  });
});

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

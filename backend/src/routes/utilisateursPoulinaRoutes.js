const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔍 Rechercher un utilisateur Poulina par numéro de poste
router.get('/:numeroPoste', (req, res) => {
  const numeroPoste = req.params.numeroPoste;

  const sql = 'SELECT nom, prenom, groupe, mail FROM utilisateurs_poulina WHERE numeroPoste = ?';

  db.query(sql, [numeroPoste], (err, result) => {
    if (err) {
      console.error('❌ Erreur lors de la requête :', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    res.json(result[0]);
  });
});

// 📥 Nouvelle route : retourner tous les utilisateurs (pour liste déroulante)
router.get('/', (req, res) => {
  const sql = 'SELECT numeroPoste, nom, prenom FROM utilisateurs_poulina ORDER BY numeroPoste ASC';

  db.query(sql, (err, result) => {
    if (err) {
      console.error('❌ Erreur récupération utilisateurs :', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    res.json(result);
  });
});

module.exports = router;

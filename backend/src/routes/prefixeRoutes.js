const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔍 Obtenir tous les préfixes
router.get('/', (req, res) => {
  db.query('SELECT * FROM prefixes', (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(result);
  });
});

// 🔍 Trouver un préfixe par numéro (tarif)
router.get('/prix/:numero', (req, res) => {
  const numero = req.params.numero;
  const sql = `
    SELECT * FROM prefixes 
    WHERE ? LIKE CONCAT(prefixe, '%')
    ORDER BY LENGTH(prefixe) DESC
    LIMIT 1
  `;
  db.query(sql, [numero], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    if (result.length === 0) return res.status(404).json({ error: 'Préfixe non trouvé' });
    res.json(result[0]);
  });
});

// ➕ Ajouter un préfixe
router.post('/', (req, res) => {
  const { prefixe, dest, prix } = req.body;
  const sql = 'INSERT INTO prefixes (prefixe, dest, prix) VALUES (?, ?, ?)';
  db.query(sql, [prefixe, dest, prix], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur lors de l\'ajout' });
    res.status(201).json({ id: result.insertId, prefixe, dest, prix });
  });
});

// ✏️ Modifier un préfixe
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { prefixe, dest, prix } = req.body;
  const sql = 'UPDATE prefixes SET prefixe = ?, dest = ?, prix = ? WHERE id = ?';
  db.query(sql, [prefixe, dest, prix, id], (err) => {
    if (err) return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    res.json({ id, prefixe, dest, prix });
  });
});

// ❌ Supprimer un préfixe
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM prefixes WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Erreur lors de la suppression' });
    res.status(204).send();
  });
});

module.exports = router;

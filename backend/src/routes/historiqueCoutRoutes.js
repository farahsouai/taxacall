const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtenir tous les numéros de poste distincts depuis la table appels
router.get('/postes', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT DISTINCT numeroPoste FROM appels WHERE numeroPoste IS NOT NULL AND numeroPoste != ''
    `);
    res.json(rows.map(r => r.numeroPoste));
  } catch (err) {
    console.error("❌ Erreur récupération des postes :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Obtenir l'historique des coûts d’un poste
router.get('/historique-cout', async (req, res) => {
  const { numeroPoste } = req.query;
  if (!numeroPoste) return res.status(400).json({ error: "numeroPoste manquant" });

  try {
    const [rows] = await db.promise().query(`
      SELECT 
        MONTH(date_appel) AS mois,
        YEAR(date_appel) AS annee,
        SUM(cout) AS total
      FROM appels
      WHERE numeroPoste = ? AND cout > 0
      GROUP BY annee, mois
      ORDER BY annee DESC, mois DESC
    `, [numeroPoste]);

    res.json(rows);
  } catch (err) {
    console.error("❌ Erreur historique coût :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
// Route temporaire de correction pour tester l’historique des coûts
router.patch('/ajuster-couts-test', async (req, res) => {
  try {
    const [result1] = await db.promise().query(`
      UPDATE appels SET cout = 1.00 WHERE cout IS NULL
    `);

    const [result2] = await db.promise().query(`
      UPDATE appels SET cout = 1.00 WHERE cout = 0
    `);

    res.json({
      message: '✅ Correction test effectuée',
      modifsNull: result1.affectedRows,
      modifsZero: result2.affectedRows
    });
  } catch (err) {
    console.error("❌ Erreur ajustement coûts :", err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;

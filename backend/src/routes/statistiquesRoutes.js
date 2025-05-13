const express = require('express');
const router = express.Router();
const db = require('../db'); 




// ➤ Route : /api/statistiques-appels
router.get('/statistiques-appels', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Date requise' });

  try {
    const [result] = await db.promise().query(`
      SELECT
        COUNT(*) AS total,
        SUM(direction_appel = 'entrant') AS entrants,
        SUM(direction_appel = 'sortant') AS sortants
      FROM appels
      WHERE DATE(date_appel) = ?
    `, [date]);

    res.json(result[0]);
  } catch (err) {
    console.error("❌ Erreur /statistiques-appels :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ➤ Route : /api/statistiques-cout-appels
router.get('/statistiques-cout-appels', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Date requise' });

  try {
    const [result] = await db.promise().query(`
      SELECT
        SUM(cout) AS total,
        AVG(cout) AS moyenne
      FROM appels
      WHERE DATE(date_appel) = ? AND cout > 0
    `, [date]);

    const [topAppels] = await db.promise().query(`
      SELECT 
        CONCAT(prenom, ' ', nom) AS nom,
        cout
      FROM appels
      WHERE DATE(date_appel) = ? AND cout > 0
      ORDER BY cout DESC
      LIMIT 5
    `, [date]);

    res.json({
      total: result[0].total || 0,
      moyenne: result[0].moyenne || 0,
      top: topAppels
    });
  } catch (err) {
    console.error("❌ Erreur /statistiques-cout-appels :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});




  router.get('/statistiques/historique-mensuel', async (req, res) => {
    try {
      const [rows] = await db.promise().query(`
        SELECT 
          MONTH(date_appel) AS mois,
          YEAR(date_appel) AS annee,
          SUM(cout) AS total
        FROM appels
        WHERE cout > 0
        GROUP BY annee, mois
        ORDER BY annee, mois
      `);
      res.json(rows);
    } catch (err) {
      console.error("❌ Erreur récupération historique mensuel :", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  

module.exports = router;

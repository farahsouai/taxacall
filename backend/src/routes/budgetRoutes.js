const express = require('express');
const router = express.Router();
const Budget = require('../model/budget');

// 🔄 Créer la table au démarrage si nécessaire
Budget.createTable();

// ✅ Endpoint pour récupérer le dernier budget disponible pour un numéro de poste
router.get('/info/:numeroPoste', (req, res) => {
  const numeroPoste = req.params.numeroPoste;
  console.log("📥 Requête GET reçue pour /budget/info/", numeroPoste);

  Budget.getDernierBudget(numeroPoste, (err, result) => {
    if (err) {
      console.error("❌ Erreur lors de la récupération du budget :", err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Budget non trouvé pour ce poste' });
    }
    res.json(result[0]);
  });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Facture = require('../model/initFactureDB');

// 🔍 Rechercher les factures par mois, nom ou numéro de poste
router.get("/search", (req, res) => {
  const { mois, nom, numeroPoste } = req.query;

  Facture.searchFactures(mois, nom, numeroPoste, (err, results) => {
    if (err) {
      console.error("❌ Erreur recherche facture :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json(results);
  });
});

// ✅ Route pour récupérer toutes les factures avec nom/prénom utilisateur
router.get("/", (req, res) => {
  Facture.getAllWithUser((err, results) => {
    if (err) {
      console.error("❌ Erreur récupération des factures :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json(results);
  });
});

module.exports = router;

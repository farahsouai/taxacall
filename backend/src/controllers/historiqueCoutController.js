const historiqueCoutService = require("../service/historiqueCoutService");

exports.getHistoriqueCout = async (req, res) => {
  const { mois, utilisateur_id } = req.query;

  if (!mois || !utilisateur_id) {
    return res.status(400).json({ error: "Paramètres requis : mois et utilisateur_id" });
  }

  try {
    const result = await historiqueCoutService.calculerEtSauvegarder(mois, utilisateur_id);
    res.json([result]);
  } catch (err) {
    console.error("❌ Erreur :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

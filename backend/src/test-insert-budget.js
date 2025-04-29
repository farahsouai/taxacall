const budget = require('./model/budget');

// Exemple d'insertion
budget.upsertBudget("548962", 3, 2025, 50.00, (err, result) => {
  if (err) {
    console.error("❌ Erreur d'insertion :", err);
  } else {
    console.log("✅ Budget inséré ou mis à jour !");
  }
});

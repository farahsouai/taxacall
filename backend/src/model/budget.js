const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const db = require('../db');

const Budget = {
  createTable: () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS budget_mensuel (
        id INT AUTO_INCREMENT PRIMARY KEY,
        numeroPoste VARCHAR(10),
        mois INT,
        annee INT,
        budget DECIMAL(10,2)
      )
    `;
    db.query(sql, (err) => {
      if (err) throw err;
      console.log("✅ Table budget_mensuel prête !");
    });
  },

  // 🆕 Nouvelle méthode pour récupérer le dernier budget disponible
  getDernierBudget: (numeroPoste, callback) => {
    console.log("🔍 Récupération du dernier budget pour le poste :", numeroPoste);
    const sql = `
      SELECT * FROM budget_mensuel
      WHERE numeroPoste = ?
      ORDER BY annee DESC, mois DESC
      LIMIT 1
    `;
    db.query(sql, [numeroPoste], callback);
  },

  insererDepuisFichierCDR: (fichier) => {
    const filePath = path.join(__dirname, '../fichiers-cdr', fichier);
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(`📊 ${filePath} contient ${data.length} lignes`);
    if (data.length > 0) {
      console.log("✅ Aperçu d'une ligne :", data[0]);
    }
  }
};

module.exports = Budget;

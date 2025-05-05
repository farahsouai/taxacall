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

  getDernierBudget: (numeroPoste, callback) => {
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

    console.log(`📊 Lecture de ${fichier} avec ${data.length} lignes`);

    const mapBudget = new Map();

    data.forEach(row => {
      const numeroPoste = String(row.numeroPoste || row.NumeroPoste || row.Poste).trim();
      const mois = parseInt(row.mois || row.Mois);
      const annee = parseInt(row.annee || row.Annee);
      const budget = parseFloat(row.budget || row.Budget || 0);

      if (!numeroPoste || isNaN(mois) || isNaN(annee)) return;

      const key = `${numeroPoste}-${mois}-${annee}`;
      const cumul = mapBudget.get(key) || 0;
      mapBudget.set(key, cumul + budget);
    });

    mapBudget.forEach((budget, key) => {
      const [numeroPoste, mois, annee] = key.split('-');
      const sql = `
        INSERT INTO budget_mensuel (numeroPoste, mois, annee, budget)
        VALUES (?, ?, ?, ?)
      `;
      db.query(sql, [numeroPoste, mois, annee, budget.toFixed(2)], (err) => {
        if (err) {
          console.error(`❌ Erreur insertion budget pour ${key} :`, err.message);
        } else {
          console.log(`✅ Budget inséré pour ${key} : ${budget.toFixed(2)} DT`);
        }
      });
    });
  },

  insererTousLesBudgets: (callback) => {
    const dossierCDR = path.join(__dirname, '../fichiers-cdr');
    const fichiers = fs.readdirSync(dossierCDR).filter(f => /\.xlsx$/i.test(f));

    fichiers.forEach(f => {
      console.log(`📄 Lecture du fichier : ${f}`);
      Budget.insererDepuisFichierCDR(f);
    });

    if (callback) callback();
  }
};

// 👇 Fonction pour tout insérer depuis les fichiers CDR
const updateBudgetsFromCDR = (callback) => {
  Budget.insererTousLesBudgets(callback || (() => {}));
};

// ✅ On exporte toutes les fonctions + updateBudgetsFromCDR
module.exports = {
  ...Budget,
  updateBudgetsFromCDR
};


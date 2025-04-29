const db = require('../db');
const XLSX = require('xlsx');
const path = require('path');

const prefixeDB = {
  createTable: () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS prefixes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        prefixe VARCHAR(10) UNIQUE,
        dest VARCHAR(100),
        prix DECIMAL(5, 3)
      )
    `;
    db.query(sql, (err) => {
      if (err) console.error("❌ Erreur création table prefixes:", err);
      else {
        console.log("✅ Table prefixes prête !");
        prefixeDB.clearAndInsert();
      }
    });
  },

  clearAndInsert: () => {
    db.query("DELETE FROM prefixes", (err) => {
      if (err) console.error("❌ Erreur nettoyage table prefixes :", err);
      else {
        console.log("🧹 Table prefixes vidée !");
        prefixeDB.insertData();
      }
    });
  },

  insertData: () => {
    const filePath = path.join(__dirname, '../data/préfixes.xls');

    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const prefixData = data.slice(1) // Ignorer l'en-tête
        .filter(row =>
          row[0] && row[1] && !isNaN(parseFloat(row[2]))
        )
        .map(row => [
          row[0].toString().trim(),
          row[1].toString().trim(),
          parseFloat(row[2])
        ]);

      const sql = `
        INSERT INTO prefixes (prefixe, dest, prix)
        VALUES ?
        ON DUPLICATE KEY UPDATE 
          prefixes.dest = VALUES(dest),
          prefixes.prix = VALUES(prix)
      `;

      db.query(sql, [prefixData], (err) => {
        if (err) console.error("❌ Erreur insertion préfixes:", err);
        else console.log("✅ Préfixes insérés depuis fichier Excel !");
      });

    } catch (e) {
      console.error("❌ Erreur lecture fichier Excel :", e.message);
    }
  }
};

module.exports = prefixeDB;

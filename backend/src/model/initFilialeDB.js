const db = require('../db');
const xlsx = require('xlsx');
const path = require('path');

const Filiale = {
  createTable: () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS filiales (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nom VARCHAR(255) NOT NULL UNIQUE,
        device_pool VARCHAR(255)
      )
    `;

    db.query(sql, (err) => {
      if (err) {
        console.error("❌ Erreur création table filiales :", err);
      } else {
        console.log("✅ Table filiales prête !");
        Filiale.resetAndInsertFiliales();
      }
    });
  },

  resetAndInsertFiliales: () => {
    const deleteSql = `DELETE FROM filiales`;

    db.query(deleteSql, (err) => {
      if (err) {
        console.error("❌ Erreur DELETE filiales :", err);
        return;
      }

      console.log("🧹 Table filiales nettoyée !");

      // 📄 Fichier Excel
      const filePath = path.join(__dirname, '..', 'data', 'DP-Filiale-clean.xlsx');

      try {
        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        const values = data
          .filter(row => row['Nom De Filiale'] && row['Device Pool'])
          .map(row => [
            String(row['Nom De Filiale']).trim(),
            String(row['Device Pool']).trim()
          ]);

        if (values.length === 0) {
          console.warn("⚠️ Aucun enregistrement valide trouvé.");
          return;
        }

        const insertSql = `
          INSERT INTO filiales (nom, device_pool)
          VALUES ?
        `;

        db.query(insertSql, [values], (err) => {
          if (err) {
            console.error("❌ Erreur insertion filiales :", err);
          } else {
            console.log(`✅ ${values.length} filiales insérées depuis DP-Filiale-clean.xlsx !`);
          }
        });

      } catch (e) {
        console.error("❌ Erreur lecture fichier Excel :", e.message);
      }
    });
  }
};

module.exports = Filiale;

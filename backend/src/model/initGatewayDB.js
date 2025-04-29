const db = require('../db');
const fs = require('fs');
const path = require('path');

const gatewayDB = {
  createTable: () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS gateways (
      id INT PRIMARY KEY AUTO_INCREMENT,
      ip VARCHAR(50) UNIQUE,
      description VARCHAR(255),
      code VARCHAR(50),
      nbre_can INT,
      code_tbl VARCHAR(50),
      groupe VARCHAR(50)
    );
  `;

    db.query(sql, (err) => {
      if (err) console.error("❌ Erreur création table gateways:", err);
      else {
        console.log("✅ Table gateways prête !");
        gatewayDB.insertData();
      }
    });
  },

  insertData: () => {
    const filePath = path.join(__dirname, '../data/GATEWAY (1).csv');

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
      const [header, ...dataLines] = lines;

      const values = dataLines.map(line => {
        const cols = line.split(';');
        const ip          = cols[0]?.trim();
        const description = cols[1]?.trim();
        const code        = cols[2]?.trim() || '';
        const nbre_can    = parseInt(cols[3], 10) || 0;
        const code_tbl    = cols[4]?.trim() || '';
        const groupe      = cols[5]?.trim() || '';
        return [ip, description, code, nbre_can, code_tbl, groupe];
      }).filter(arr => arr[0]);

      if (values.length === 0) {
        console.log("ℹ️ Aucun gateway à insérer.");
        return;
      }

      const sql = `
        INSERT INTO gateways (ip, description, code, nbre_can, code_tbl, groupe)
        VALUES ?
        ON DUPLICATE KEY UPDATE
          description = VALUES(description),
          code        = VALUES(code),
          nbre_can    = VALUES(nbre_can),
          code_tbl    = VALUES(code_tbl),
          groupe      = VALUES(groupe)
      `;

      db.query(sql, [values], (err) => {
        if (err) console.error("❌ Erreur insertion gateways:", err);
        else console.log("✅ Gateways insérés depuis le fichier CSV !");
      });
    } catch (e) {
      console.error("❌ Erreur lecture fichier CSV :", e.message);
    }
  }
};

module.exports = gatewayDB;

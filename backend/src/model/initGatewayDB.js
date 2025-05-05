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
      groupe INT
    )
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
    const filePath = path.join(__dirname, '../data/gateway.csv');
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim() !== '');
      const data = lines.slice(1);
  
      const values = data.map(line => {
        const [ip, description, code, nbre_can, code_tbl, groupe] = line.split(';');
        return [
          ip?.trim(),
          description?.trim(),
          code?.trim() || '',
          parseInt(nbre_can) || 0,
          code_tbl?.trim() || '',
          parseInt(groupe) || null
        ];
      });
  
      const sql = `
        INSERT INTO gateways (ip, description, code, nbre_can, code_tbl, groupe)
        VALUES ?
        ON DUPLICATE KEY UPDATE 
          description = VALUES(description),
          code = VALUES(code),
          nbre_can = VALUES(nbre_can),
          code_tbl = VALUES(code_tbl),
          groupe = VALUES(groupe)
      `;
  
      db.query(sql, [values], (err) => {
        if (err) console.error("❌ Erreur insertion gateways:", err);
        else console.log("✅ Gateways insérés avec groupe !");
      });
  
    } catch (e) {
      console.error("❌ Erreur lecture fichier CSV :", e.message);
    }
  }
  
};

module.exports = gatewayDB;

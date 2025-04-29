const db = require('../db');

const HistoriqueCout = {
  createTable: () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS historique_cout (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mois INT NOT NULL,
        utilisateur_id VARCHAR(20) NOT NULL,
        total DECIMAL(10,3) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    db.query(sql, (err) => {
      if (err) {
        console.error("❌ Erreur création table 'historique_cout' :", err);
      } else {
        console.log("✅ Table 'historique_cout' créée ou déjà existante !");
      }
    });
  },

  // (optionnel) Ajout de données de test
  insertTestData: () => {
    const sql = `
      INSERT INTO historique_cout (mois, utilisateur_id, total)
      VALUES 
      (3, '123456', 42.345),
      (3, '789101', 87.123)
    `;
    db.query(sql, (err) => {
      if (err) {
        console.error("❌ Erreur insertion données :", err);
      } else {
        console.log("✅ Données de test insérées !");
      }
    });
  }
};

module.exports = HistoriqueCout;

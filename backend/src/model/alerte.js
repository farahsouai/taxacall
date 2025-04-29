const db = require('../db');

const Alerte = {
  createTable: () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS alertes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        numeroPoste VARCHAR(50),
        cout DECIMAL(10,2),
        seuil DECIMAL(10,2),
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    db.query(sql, (err) => {
      if (err) {
        console.error("❌ Erreur création table alertes:", err);
      } else {
        console.log("✅ Table alertes prête !");

        // Insérer tous les utilisateurs comme alertes avec valeurs par défaut
        Alerte.importDepuisUtilisateursPoulina(100.0, 120.0, (err, result) => {
          if (err) console.error("❌ Erreur import utilisateurs :", err);
          else console.log("✅ Import terminé :", result);
        });
      }
    });
  },

  importDepuisUtilisateursPoulina: (seuilParDefaut, coutParDefaut, callback) => {
    const sql = `
      INSERT INTO alertes (nom, prenom, numeroPoste, cout, seuil)
      SELECT nom, prenom, numeroPoste, ?, ?
      FROM utilisateurs_poulina
    `;
    db.query(sql, [coutParDefaut, seuilParDefaut], callback);
  },

  checkAndInsertAlerte: (numeroPoste, cout, seuil, callback) => {
    if (cout > seuil) {
      const sql = `
        INSERT INTO alertes (numeroPoste, nom, prenom, cout, seuil)
        SELECT u.numeroPoste, u.nom, u.prenom, ?, ?
        FROM utilisateurs_poulina u
        WHERE u.numeroPoste = ?
      `;
      db.query(sql, [cout, seuil, numeroPoste], callback);
    } else {
      callback(null, { message: "Pas d'alerte, seuil non dépassé." });
    }
  },

  getAllAlertes: (callback) => {
    const sql = `SELECT * FROM alertes ORDER BY date DESC`;
    db.query(sql, callback);
  }
};

module.exports = Alerte;

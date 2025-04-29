const db = require('../db');

const appelNationauxDB = {
  createTable: () => {
    const query = `
      CREATE TABLE IF NOT EXISTS appelNationaux (
        id INT AUTO_INCREMENT PRIMARY KEY,
        numeroPoste VARCHAR(10) NOT NULL,
        dateAppel DATETIME NOT NULL,
        duree INT NOT NULL,
        numero VARCHAR(20),
        cout DECIMAL(10,2) NOT NULL,
        operateur VARCHAR(50),
        typeAppel ENUM('INTERNE', 'INTER_FILIALES', 'NATIONAL', 'INTERNATIONAL') NOT NULL,
        filiale VARCHAR(100)
      )
    `;

    db.query(query, (err) => {
      if (err) {
        console.error("❌ Erreur création table appels :", err);
      } else {
        console.log("✅ Table appelNationaux prête !");
      }
    });
  },

  insertAppel: (appelData, callback) => {
    const { numeroPoste, dateAppel, duree,  numero,cout, operateur, typeAppel } = appelData;

    const getFilialeSql = `SELECT nom FROM filiales WHERE numeroPoste = ?`;

    db.query(getFilialeSql, [numeroPoste], (err, result) => {
      if (err) {
        console.error("❌ Erreur lors de la recherche de la filiale :", err);
        return callback(err);
      }

      const filiale = result.length > 0 ? result[0].nom : null;

      const insertSql = `
        INSERT INTO appelNationaux 
        (numeroPoste, dateAppel, duree, numero, cout, operateur, typeAppel, filiale)
        VALUES (?, ?, ?, ?, ?,?, ?, ?)
      `;

      db.query(
        insertSql,
        [numeroPoste, dateAppel, duree, numero, cout, operateur, typeAppel, filiale],
        (err, result) => {
          if (err) {
            console.error("❌ Erreur insertion appel nationaux :", err);
            return callback(err);
          }

          console.log("✅ Appel inséré dans appelNationaux !");
          callback(null, result);
        }
      );
    });
  }
};

module.exports = appelNationauxDB;
const db = require('../db');

const appelInternationauxDB = {
  createTable: () => {
    const query = `
      CREATE TABLE IF NOT EXISTS appelsInternationaux (
        id INT AUTO_INCREMENT PRIMARY KEY,
        numeroPoste VARCHAR(10) NOT NULL,
        dateAppel DATETIME NOT NULL,
        duree INT NOT NULL,
        numero VARCHAR(20),
        cout DECIMAL(10,2) NOT NULL,
        operateur VARCHAR(50),
        pays VARCHAR(100),
        filiale VARCHAR(100)
      )
    `;

    db.query(query, (err) => {
      if (err) {
        console.error("❌ Erreur création table appelsInternationaux:", err);
      } else {
        console.log("✅ Table appelsInternationaux prête !");
      }
    });
  },

  // ✅ Méthode pour récupérer les appels par numéro de poste
  findByNumeroPoste: (numeroPoste, callback) => {
    const sql = `
      SELECT dateAppel, numero, operateur, pays, duree, cout, filiale
      FROM appelsInternationaux
      WHERE numeroPoste = ?
    `;

    db.query(sql, [numeroPoste], (err, results) => {
      if (err) {
        console.error("❌ Erreur lors de la recherche des appels internationaux:", err);
        return callback(err);
      }
      callback(null, results);
    });
  }
};

module.exports = appelInternationauxDB;

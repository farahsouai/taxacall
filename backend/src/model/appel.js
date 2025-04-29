const db = require('../db');

// Création de la table
const Appel = {
  createTable: () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS appels (
        id INT PRIMARY KEY AUTO_INCREMENT,
        date_appel DATETIME,
        poste VARCHAR(50),
        numero VARCHAR(20),
        operateur VARCHAR(50),
        duree TIME,
        cout DECIMAL(10,2),
        utilisateur_id INT,
       
        type_appel ENUM('national', 'international', 'inter-filiale') NOT NULL DEFAULT 'national',
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id),
        
      )
    `;
    db.query(sql, (err) => {
      if (err) {
        console.error("❌ Erreur lors de la création de la table appels :", err);
      } else {
        console.log("✅ Table appels prête !");
      }
    });
  },

  // ✅ Insertion d'un appel
  insertAppel: (date_appel, numero, operateur, duree, cout, utilisateur_id, type_appel, callback) => {
    const sql = `
      INSERT INTO appels (date_appel, numero, operateur, duree, cout, utilisateur_id, type_appel)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [date_appel, numero, operateur, duree, cout, utilisateur_id|| null, type_appel], (err, result) => {
      if (err) {
        console.error("❌ Erreur lors de l'insertion de l'appel :", err);
        callback(err, null);
      } else {
        console.log("✅ Appel inséré avec succès !");
        callback(null, result);
      }
    });
  },

  // ✅ Filtrage des appels avec critères
  findWithFilters: (filters, callback) => {
    let sql = 'SELECT * FROM appels WHERE 1=1';
    const params = [];

    if (filters.date) {
      sql += ' AND DATE(date_appel) = ?';
      params.push(filters.date);
    }
    if (filters.poste) {
      sql += ' AND poste = ?';
      params.push(filters.poste);
    }
    if (filters.numero) {
      sql += ' AND numero = ?';
      params.push(filters.numero);
    }
    if (filters.operateur) {
      sql += ' AND operateur = ?';
      params.push(filters.operateur);
    }
    if (filters.type_appel) {
      sql += ' AND type_appel = ?';
      params.push(filters.type_appel);
    }

    db.query(sql, params, callback);
  },

  // ✅ Récupérer les appels nationaux
  findNationaux: (callback) => {
    const sql = `SELECT * FROM appels WHERE type_appel = 'national'`;
    db.query(sql, (err, results) => {
      if (err) {
        console.error("❌ Erreur lors de la récupération des appels nationaux :", err);
        callback(err, null);
      } else {
        console.log("✅ Résultats des appels nationaux récupérés !");
        callback(null, results);
      }
    });
  },

  // ✅ Récupérer les appels internationaux
  findInternationaux: (callback) => {
    const sql = `SELECT * FROM appels WHERE type_appel = 'international'`;
    db.query(sql, (err, results) => {
      if (err) {
        console.error("❌ Erreur lors de la récupération des appels internationaux :", err);
        callback(err, null);
      } else {
        console.log("✅ Résultats des appels internationaux récupérés !");
        callback(null, results);
      }
    });
  },

  getConsommationParPoste: (numeroPoste, callback) => {
    const now = new Date();
    const mois = now.getMonth() + 1;
    const annee = now.getFullYear();
  
    const sql = `
        SELECT numeroPoste, SUM(cout) AS consommation
    FROM appels
    WHERE numeroPoste = ?
    GROUP BY numeroPoste
    ORDER BY mois DESC, annee DESC
    LIMIT 1
    `;
    db.query(sql, [numeroPoste, mois, annee], (err, result) => {
      if (err) {
        console.error("❌ Erreur consommation :", err);
        callback(err, null);
      } else {
        callback(null, result[0]);
      }
    });
  },
  
  getDerniereConsommation: (numeroPoste, callback) => {
    const sql = `
      SELECT mois, annee, SUM(cout) as consommation
      FROM appels
      WHERE numeroPoste = ?
      GROUP BY mois, annee
      ORDER BY annee DESC, mois DESC
      LIMIT 1
    `;
    db.query(sql, [numeroPoste], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0] || { consommation: 0 });
    });
  },

    
  
};

module.exports = Appel;

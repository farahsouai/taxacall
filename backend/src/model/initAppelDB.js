const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const db = require('../db');

const dossierCDR = path.join(__dirname, '../fichiers-cdr');

const Appel = {
  createTable: () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS appels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date_appel DATE,
        numeroPoste VARCHAR(10),
        operateur VARCHAR(50),
        duree INT,
        cout DECIMAL(10,2),
        nom VARCHAR(100),
        prenom VARCHAR(100),
        filiale VARCHAR(100),
        type_appel VARCHAR(20),
        mois INT,
        annee INT
      )
    `;
    db.query(sql, (err) => {
      if (err) throw err;
      console.log("✅ Table appels prête !");
      Appel.importCDRs();
    });
  },

  importCDRs: () => {
    const fichiers = fs.readdirSync(dossierCDR).filter(f => f.endsWith('.xlsx'));

    fichiers.forEach(fichier => {
      const filePath = path.join(dossierCDR, fichier);
      const workbook = xlsx.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);

      console.log(`📊 ${fichier} contient ${data.length} lignes`);
      if (data.length > 0) console.log("✅ Exemple ligne :", data[0]);

      data.forEach(row => {
        const numeroPoste = row.numeroPoste || row.callingPartyNumber;
        const date_appel = new Date(); // par défaut la date d'import
        const mois = date_appel.getMonth() + 1;
        const annee = date_appel.getFullYear();

        const duree = parseInt(row.duree || row.duration);
        const cout = duree ? parseFloat((duree * 0.02).toFixed(2)) : 0;

        // Validation stricte : ignorer lignes invalides
        if (!numeroPoste || isNaN(duree) || isNaN(cout)) {
          console.warn('⚠️ Ligne ignorée (données invalides) :', row);
          return;
        }

        const operateur = row.operateur || "Inconnu";
        const nom = row.nom || "-";
        const prenom = row.prenom || "-";
        const filiale = row.filiale || "-";
        const type_appel = row.type || "National";

        const sql = `
          INSERT INTO appels 
          (date_appel, numeroPoste, operateur, duree, cout, nom, prenom, filiale, type_appel, mois, annee)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(sql, [
          date_appel, numeroPoste, operateur, duree,
          cout, nom, prenom, filiale, type_appel,
          mois, annee
        ], (err) => {
          if (err) console.error("❌ Erreur insertion appel :", err);
        });
      });
    });
  }
};

module.exports = Appel;

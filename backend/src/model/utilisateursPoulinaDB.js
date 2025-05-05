const db = require('../db');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');

const dossierCDR = path.join(__dirname, '..', 'fichiers-cdr');
const dossierExport = path.join(__dirname, '..', 'data');

const getFilialeId = (nom, callback) => {
  if (!nom) return callback(null, null);
  const sql = `SELECT id FROM filiales WHERE nom = ? LIMIT 1`;
  db.query(sql, [nom], (err, results) => {
    if (err || results.length === 0) return callback(null, null);
    callback(null, results[0].id);
  });
};

const updateNumerosPosteFromCDR = () => {
  const fichiersCDR = fs.readdirSync(dossierCDR).filter(f => /\.(xlsx|xls|csv)$/i.test(f));
  const fichiersExport = fs.readdirSync(dossierExport).filter(f => /^export.*\.xlsx$/i.test(f));

  const fichiers = [...fichiersCDR.map(f => path.join(dossierCDR, f)), ...fichiersExport.map(f => path.join(dossierExport, f))];
  const utilisateurs = new Map();

  fichiers.forEach(fullPath => {
    let workbook;
    if (/\.csv$/i.test(fullPath)) {
      const csvContent = fs.readFileSync(fullPath, 'utf8');
      workbook = xlsx.read(csvContent, { type: 'string' });
    } else {
      workbook = xlsx.readFile(fullPath);
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: null });

    rows.forEach(raw => {
      const lower = Object.entries(raw).reduce((acc, [k, v]) => {
        const key = k.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        acc[key] = typeof v === 'string' ? v.trim() : v;
        return acc;
      }, {});

      let numeroPoste = (
        lower.numeroposte ||
        lower.callingpartynumber ||
        lower.poste ||
        ''
      ).toString();

      numeroPoste = numeroPoste.replace(/\D/g, '');
      if (!numeroPoste || numeroPoste === 'INTERNEPT' || numeroPoste === 'VARCHAR50') {
        return;
      }

      const nom = lower.nom || null;
      const prenom = lower.prenom || null;
      const mail = lower.mail || lower.email || null;
      const groupe = lower.groupe || null;
      const filiale = lower.filiale || null;

      utilisateurs.set(numeroPoste, { numeroPoste, nom, prenom, mail, groupe, filiale });
    });
  });

  console.log(`📦 Utilisateurs à insérer ou mettre à jour : ${utilisateurs.size}`);

  utilisateurs.forEach(util => {
    getFilialeId(util.filiale, (err, filialeId) => {
      const sql = `
        INSERT INTO utilisateurs_poulina
          (numeroPoste, nom, prenom, mail, groupe, filiale, filiale_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          nom = VALUES(nom),
          prenom = VALUES(prenom),
          mail = VALUES(mail),
          groupe = VALUES(groupe),
          filiale = VALUES(filiale),
          filiale_id = VALUES(filiale_id)
      `;
      const params = [
        util.numeroPoste,
        util.nom,
        util.prenom,
        util.mail,
        util.groupe,
        util.filiale,
        filialeId
      ];

      db.query(sql, params, err => {
        if (err) {
          console.error(`❌ Erreur insertion pour poste ${util.numeroPoste} :`, err.message);
        } else {
          console.log(`✅ Utilisateur inséré / mis à jour : ${util.numeroPoste}`);
        }
      });
    });
  });
};

const createTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS utilisateurs_poulina (
      id INT PRIMARY KEY AUTO_INCREMENT,
      nom VARCHAR(100),
      prenom VARCHAR(100),
      numeroPoste VARCHAR(10) UNIQUE,
      groupe VARCHAR(100),
      mail VARCHAR(100),
      filiale VARCHAR(100),
      filiale_id INT,
      FOREIGN KEY (filiale_id) REFERENCES filiales(id)
    )
  `;
  db.query(sql, err => {
    if (err) {
      console.error("❌ Erreur création table utilisateurs_poulina :", err);
    } else {
      console.log("✅ Table utilisateurs_poulina prête !");
    }
  });
};

module.exports = {
  createTable,
  updateNumerosPosteFromCDR
};

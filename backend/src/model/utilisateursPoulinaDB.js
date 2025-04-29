// src/model/initUtilisateursPoulinaDB.js

const db    = require('../db');
const path  = require('path');
const fs    = require('fs');
const xlsx  = require('xlsx');

// ← Pointe vers le dossier où sont export (1).xlsx & export (2).xlsx
const dossierCDR = path.join(__dirname, '..', 'fichiers-cdr');

const updateNumerosPosteFromCDR = () => {
  // on supporte .xlsx, .xls et .csv
  const fichiers = fs
    .readdirSync(dossierCDR)
    .filter(f => /\.(xlsx|xls|csv)$/i.test(f));

  const utilisateurs = new Map();

  fichiers.forEach(fichier => {
    const fullPath = path.join(dossierCDR, fichier);
    let workbook;

    if (/\.csv$/i.test(fichier)) {
      // lecture CSV
      const csvContent = fs.readFileSync(fullPath, 'utf8');
      workbook = xlsx.read(csvContent, { type: 'string' });
    } else {
      // lecture XLSX/XLS
      workbook = xlsx.readFile(fullPath);
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows  = xlsx.utils.sheet_to_json(sheet, { defval: null });

    rows.forEach(raw => {
      // Normalisation des clés : trim, lowercase, sans caractères spéciaux
      const lower = Object.entries(raw).reduce((acc, [k, v]) => {
        const key = k
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');
        acc[key] = typeof v === 'string' ? v.trim() : v;
        return acc;
      }, {});

      // Récupérer le numéro de poste
      let numeroPoste = (
        lower.numeroposte ||
        lower.callingpartynumber ||
        lower.poste ||
        ''
      ).toString();
      // ne garder que les chiffres
      numeroPoste = numeroPoste.replace(/\D/g, '');
      if (
        !numeroPoste ||
        numeroPoste === 'INTERNEPT' ||
        numeroPoste === 'VARCHAR50'
      ) {
        return; // on ignore si vide ou valeur indésirable
      }

      // Extraire les autres champs
      const nom    = lower.nom       || null;
      const prenom = lower.prenom    || null;
      const mail   = lower.mail      || lower.email || null;
      const groupe = lower.groupe    || null;

      utilisateurs.set(numeroPoste, { numeroPoste, nom, prenom, mail, groupe });
    });
  });

  console.log(`📦 Utilisateurs à insérer ou mettre à jour : ${utilisateurs.size}`);

  utilisateurs.forEach(util => {
    const sql = `
      INSERT INTO utilisateurs_poulina
        (numeroPoste, nom, prenom, mail, groupe)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        nom    = VALUES(nom),
        prenom = VALUES(prenom),
        mail   = VALUES(mail),
        groupe = VALUES(groupe)
    `;
    const params = [
      util.numeroPoste,
      util.nom,
      util.prenom,
      util.mail,
      util.groupe
    ];

    db.query(sql, params, err => {
      if (err) {
        console.error(`❌ Erreur insertion pour poste ${util.numeroPoste} :`, err.message);
      } else {
        console.log(`✅ Utilisateur inséré / mis à jour : ${util.numeroPoste}`);
      }
    });
  });
};

const createTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS utilisateurs_poulina (
      id INT PRIMARY KEY AUTO_INCREMENT,
      nom           VARCHAR(100),
      prenom        VARCHAR(100),
      numeroPoste   VARCHAR(10) UNIQUE,
      groupe        VARCHAR(100),
      mail          VARCHAR(100)
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

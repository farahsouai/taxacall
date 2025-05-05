const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const mysql = require('mysql2');
const db = require('../db');

const dossierCDR = path.join(__dirname, '..', 'fichiers-cdr');
const dossierExport = path.join(__dirname, '..', 'data');

const HistoriqueCout = {
  createTable: () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS historique_cout (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mois INT NOT NULL,
        numeroPoste VARCHAR(10) NOT NULL,
        nom VARCHAR(100),
        prenom VARCHAR(100),
        total DECIMAL(10,3) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_entry (mois, numeroPoste)
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

  insertFromCDRFiles: async () => {
    const connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      port: 3307,
      database: 'montaxacall_test'
    });

    const fichiersCDR = fs.readdirSync(dossierCDR).filter(f => /\.(xlsx|xls)$/i.test(f));
    const fichiersExport = fs.readdirSync(dossierExport).filter(f => /^export.*\.xlsx$/i.test(f));
    const mois = new Date().getMonth() + 1;
    const numeros = new Set();
    const posteInfoMap = new Map();

    const fichiers = [...fichiersCDR.map(f => path.join(dossierCDR, f)), ...fichiersExport.map(f => path.join(dossierExport, f))];

    // Extraire noms/prénoms depuis les fichiers Export
    fichiersExport.map(f => path.join(dossierExport, f)).forEach(chemin => {
      const workbook = xlsx.readFile(chemin);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet, { defval: '' });

      data.forEach(row => {
        const brut = row.Poste || row.poste || row.numeroPoste || '';
        const nettoye = brut.toString().replace(/\D/g, '');
        if (nettoye && nettoye.length >= 3) {
          const nom = row.Nom || row.nom || '';
          const prenom = row.Prenom || row.prenom || row.Prénom || '';
          posteInfoMap.set(nettoye, { nom: nom.trim(), prenom: prenom.trim() });
        }
      });
    });

    fichiers.forEach(chemin => {
      const workbook = xlsx.readFile(chemin);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet, { defval: '' });

      console.log(`✅ Fichier "${path.basename(chemin)}" traité avec ${data.length} lignes.`);

      data.forEach(row => {
        const lower = Object.entries(row).reduce((acc, [k, v]) => {
          const key = k.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
          acc[key] = typeof v === 'string' ? v.trim() : v;
          return acc;
        }, {});

        const brut = lower.numeroposte || lower.callingpartynumber || lower.poste || '';
        const nettoye = brut.toString().replace(/\D/g, '');

        if (nettoye && nettoye.length >= 3) {
          numeros.add(nettoye);
        }
      });
    });

    console.log(`📊 ${numeros.size} numéros extraits.`);

    for (const numeroPoste of numeros) {
      const queryTotal = `
        SELECT SUM(cout) AS total FROM appels WHERE numeroPoste = ? AND mois = ?
      `;
      connection.query(queryTotal, [numeroPoste, mois], (err, results) => {
        if (err) {
          console.error(`❌ Erreur total pour ${numeroPoste} :`, err.message);
          return;
        }

        if (!results.length || results[0].total === null) {
          console.warn(`❌ ${numeroPoste} ignoré : total nul`);
          return;
        }

        const total = parseFloat(results[0].total);
        const info = posteInfoMap.get(numeroPoste) || { nom: null, prenom: null };

        const insertSQL = `
          INSERT INTO historique_cout (mois, numeroPoste, nom, prenom, total)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE total = VALUES(total), nom = VALUES(nom), prenom = VALUES(prenom)
        `;

        connection.query(insertSQL, [mois, numeroPoste, info.nom, info.prenom, total], (err2) => {
          if (err2) {
            console.error(`❌ Erreur insertion ${numeroPoste} :`, err2.message);
          } else {
            console.log(`✅ ${numeroPoste} ➝ ${isNaN(total) ? '0.000' : total.toFixed(3)} DT (${info.nom || '-'} ${info.prenom || '-'})`);
          }
        });
      });
    }
  }
};

module.exports = HistoriqueCout;

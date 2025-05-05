const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const db = require('../db');

const dossierCDR = path.join(__dirname, '../fichiers-cdr');
const dossierExport = path.join(__dirname, '../data');

const Facture = {
  createTable: () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS factures (
        id INT AUTO_INCREMENT PRIMARY KEY,
        numeroPoste VARCHAR(10),
        nom VARCHAR(100),
        prenom VARCHAR(100),
        mois INT,
        annee INT,
        montant_total DECIMAL(10,2),
        format VARCHAR(20),
        date_generation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    db.query(sql, (err) => {
      if (err) throw err;
      console.log("✅ Table 'factures' prête !");
    });
  },
  searchByMoisEtPoste: (mois, numeroPoste, callback) => {
    const sql = `
      SELECT id, numeroPoste, nom, prenom, mois, annee, montant_total, format, date_generation
      FROM factures
      WHERE mois = ? AND numeroPoste = ?
    `;
    db.query(sql, [mois, numeroPoste], callback);
  },
  

  insertFacture: (facture, callback) => {
    const { numeroPoste, mois, annee, montant_total, format } = facture;

    const getUserQuery = 'SELECT nom, prenom FROM utilisateurs WHERE numeroPoste = ?';
    db.query(getUserQuery, [numeroPoste], (err, result) => {
      let nom = '-';
      let prenom = '-';

      if (!err && result.length > 0) {
        nom = result[0].nom || '-';
        prenom = result[0].prenom || '-';
      }

      const insertQuery = `
        INSERT INTO factures (numeroPoste, nom, prenom, mois, annee, montant_total, format)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [numeroPoste, nom, prenom, mois, annee, montant_total, format];
      db.query(insertQuery, values, callback);
    });
  },

  seedFactures: () => {
    const fichiersCDR = fs.readdirSync(dossierCDR).filter(f => /\.xlsx$/i.test(f));
    const fichiersExport = fs.readdirSync(dossierExport).filter(f => /^export.*\.xlsx$/i.test(f));
    const fichiers = [...fichiersCDR.map(f => path.join(dossierCDR, f)), ...fichiersExport.map(f => path.join(dossierExport, f))];

    fichiers.forEach((filePath) => {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

      rows.forEach((row) => {
        const facture = {
          numeroPoste: String(row.numeroPoste || row.NumeroPoste || row['numero poste'] || row.Poste || row.poste).trim(),
          mois: parseInt(row.mois || row.Mois),
          annee: parseInt(row.annee || row.Annee),
          montant_total: parseFloat(row.montant_total || row.Montant || row.total || row.Total),
          format: (row.format || row.Format || 'excel').toLowerCase()
        };

        if (!facture.numeroPoste || isNaN(facture.mois) || isNaN(facture.annee) || isNaN(facture.montant_total)) {
          console.warn("⚠️ Ligne ignorée (champ manquant ou invalide) :", row);
          return;
        }

        Facture.insertFacture(facture, (err) => {
          if (err) {
            console.error("❌ Erreur insertion facture :", err.message);
          } else {
            console.log(`✅ Facture insérée : ${facture.numeroPoste}`);
          }
        });
      });

      console.log(`📁 Fichier "${path.basename(filePath)}" traité avec ${rows.length} lignes.`);
    });
  },

  getAllWithUser: (callback) => {
    const sql = `
      SELECT f.id, f.numeroPoste, f.mois, f.annee, f.montant_total, f.format, f.date_generation,
             f.nom, f.prenom
      FROM factures f
      ORDER BY f.annee DESC, f.mois DESC
    `;
    db.query(sql, callback);
  },

  updateFacture: (id, data, callback) => {
    const { mois, annee, montant_total, format } = data;
    const sql = `
      UPDATE factures
      SET mois = ?, annee = ?, montant_total = ?, format = ?
      WHERE id = ?
    `;
    db.query(sql, [mois, annee, montant_total, format, id], callback);
  },
};

module.exports = Facture;

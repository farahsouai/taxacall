const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const db = require('../db');
const utilisateurModel = require('./utilisateur');

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
      console.log("✅ Nouvelle table 'factures' prête !");
    });
  },

  insertFacture: (facture, callback) => {
    const { numeroPoste, mois, annee, montant_total, format } = facture;

    const getUserQuery = 'SELECT nom, prenom FROM utilisateurs WHERE numeroPoste = ?';
    db.query(getUserQuery, [numeroPoste], (err, result) => {
      if (err) return callback(err);
      if (result.length === 0) return callback(new Error("Utilisateur non trouvé"));

      const { nom, prenom } = result[0];

      const insertQuery = `
        INSERT INTO factures (numeroPoste, nom, prenom, mois, annee, montant_total, format)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [numeroPoste, nom, prenom, mois, annee, montant_total, format];
      db.query(insertQuery, values, callback);
    });
  },

  seedFactures: () => {
    const filePaths = [
      path.join(__dirname, '../fichiers-cdr/cdr_1.xlsx'),
      path.join(__dirname, '../fichiers-cdr/cdr_2.xlsx'),
      path.join(__dirname, '../fichiers-cdr/cdr_3.xlsx')
    ];

    filePaths.forEach((filePath) => {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet);

      rows.forEach((row) => {
        console.log("📘 Ligne lue depuis Excel :", row);

        const facture = {
          numeroPoste: String(row.numeroPoste || row.NumeroPoste || row['numero poste']).trim(),
          mois: parseInt(row.mois || row.Mois),
          annee: parseInt(row.annee || row.Annee),
          montant_total: parseFloat(row.montant_total || row.Montant || row.total || row.Total),
          format: (row.format || row.Format || 'excel').toLowerCase()
        };

        if (!facture.numeroPoste || isNaN(facture.mois) || isNaN(facture.annee) || isNaN(facture.montant_total)) {
          console.warn("⚠️ Ligne ignorée (donnée manquante ou invalide) :", row);
          return;
        }

        Facture.insertFacture(facture, (err) => {
          if (err) {
            console.error("❌ Erreur insertion facture :", err.message);
          } else {
            console.log(`✅ Facture ajoutée pour ${facture.numeroPoste}`);
          }
        });
      });

      console.log(`✅ Fichier "${path.basename(filePath)}" traité avec ${rows.length} lignes.`);
    });
  },

  getAllWithUser: (callback) => {
    const sql = `
      SELECT f.id, f.numeroPoste, f.mois, f.annee, f.montant_total, f.format, f.date_generation,
             u.nom, u.prenom
      FROM factures f
      JOIN utilisateurs u ON f.numeroPoste = u.numeroPoste
      ORDER BY f.annee DESC, f.mois DESC
    `;
    db.query(sql, callback);
  },

  searchFactures: (mois, nom, numeroPoste, callback) => {
    const conditions = [];
    const values = [];

    if (mois) {
      conditions.push("f.mois = ?");
      values.push(mois);
    }
    if (nom) {
      conditions.push("u.nom LIKE ?");
      values.push(`%${nom}%`);
    }
    if (numeroPoste) {
      conditions.push("f.numeroPoste = ?");
      values.push(numeroPoste);
    }

    let sql = `
      SELECT f.id, f.numeroPoste, f.mois, f.annee, f.montant_total, f.format, f.date_generation,
             u.nom, u.prenom
      FROM factures f
      JOIN utilisateurs u ON f.numeroPoste = u.numeroPoste
    `;

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY f.annee DESC, f.mois DESC";

    db.query(sql, values, callback);
  }
};

module.exports = Facture;

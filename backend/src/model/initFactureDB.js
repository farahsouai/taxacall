const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const db = require('../db');

const fichierFacture = path.join(__dirname, '../data/factures_generees_par_cdr.xlsx'); // adapte le nom si besoin

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
        date_generation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        utilisateur_id INT,
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
      )
    `;
    db.query(sql, (err) => {
      if (err) throw err;
      console.log("✅ Table 'factures' prête !");
    });
  },

  insertFacture: (facture, callback) => {
    const { numeroPoste, mois, annee, montant_total, format } = facture;
    const getUserQuery = 'SELECT id, nom, prenom FROM utilisateurs WHERE numeroPoste = ?';

    db.query(getUserQuery, [numeroPoste], (err, result) => {
      let nom = '-', prenom = '-', utilisateur_id = null;

      if (!err && result.length > 0) {
        nom = result[0].nom || '-';
        prenom = result[0].prenom || '-';
        utilisateur_id = result[0].id;
      }

      const insertQuery = `
        INSERT INTO factures (numeroPoste, nom, prenom, mois, annee, montant_total, format, utilisateur_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [numeroPoste, nom, prenom, mois, annee, montant_total, format, utilisateur_id];

      db.query(insertQuery, values, callback);
    });
  },

  seedFactures: () => {
    if (!fs.existsSync(fichierFacture)) {
      console.error("❌ Fichier Excel non trouvé :", fichierFacture);
      return;
    }

    const workbook = xlsx.readFile(fichierFacture);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    console.log(`📄 Lecture fichier : ${path.basename(fichierFacture)} contient ${rows.length} lignes`);

    rows.forEach((row) => {
      if (Object.values(row).every(v => v === '')) return;

      const facture = {
        numeroPoste: String(row.numeroPoste || row.Poste || row.poste || '').trim(),
        mois: parseInt(row.mois || row.Mois),
        annee: parseInt(row.annee || row.Annee),
        montant_total: parseFloat(row.montant_total || row.Montant || row.total),
        format: (row.format || 'excel').toLowerCase()
      };

      

      if (!facture.numeroPoste || isNaN(facture.mois) || isNaN(facture.annee) || isNaN(facture.montant_total)) {
        console.warn("⚠️ Ligne ignorée (champ manquant ou invalide) :", row);
        return;
      }

      Facture.insertFacture(facture, (err) => {
        if (err) {
          console.error("❌ Erreur insertion facture :", err.message);
        } else {
         
        }
      });
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
  }
};

// Création et insertion au démarrage si fichier exécuté
Facture.createTable();
setTimeout(() => Facture.seedFactures(), 1000);

module.exports = Facture;

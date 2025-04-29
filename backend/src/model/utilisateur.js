const db = require('../db');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');

const Utilisateur = {
  createTable: () => {
    const query = `
      CREATE TABLE IF NOT EXISTS utilisateurs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        numeroPoste VARCHAR(6) UNIQUE NOT NULL,
        motDePasse VARCHAR(255) NOT NULL,
        role ENUM('ADMIN', 'UTILISATEUR') DEFAULT 'UTILISATEUR' NOT NULL
      )`;
    db.query(query, (err) => {
      if (err) console.error("❌ Erreur création table utilisateurs :", err);
      else console.log("✅ Table utilisateurs prête !");
    });
  },

  updateTable: () => {
    console.log("🔄 Vérification et mise à jour de la table utilisateurs...");

    const checkNumeroPosteQuery = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'utilisateurs' AND COLUMN_NAME = 'numeroPoste'
    `;

    db.query(checkNumeroPosteQuery, (err, results) => {
      if (err) {
        console.error("❌ Erreur vérification colonne numeroPoste :", err);
        return;
      }

      if (results.length === 0) {
        console.log("📌 Ajout de la colonne numeroPoste...");

        const addQuery = `ALTER TABLE utilisateurs ADD COLUMN numeroPoste VARCHAR(6) UNIQUE NULL`;
        db.query(addQuery, (err) => {
          if (err) {
            console.error("❌ Erreur ajout colonne numeroPoste :", err);
            return;
          }
          console.log("✅ Colonne numeroPoste ajoutée avec succès.");

          const cleanQuery = `UPDATE utilisateurs SET numeroPoste = NULL WHERE numeroPoste = '' OR numeroPoste IS NULL`;
          db.query(cleanQuery, (err) => {
            if (err) console.error("❌ Erreur nettoyage des valeurs vides :", err);
            else {
              console.log("✅ Données nettoyées.");
              const modifyQuery = `ALTER TABLE utilisateurs MODIFY COLUMN numeroPoste VARCHAR(6) UNIQUE NOT NULL`;
              db.query(modifyQuery, (err) => {
                if (err) console.error("❌ Erreur mise à jour NOT NULL :", err);
                else console.log("✅ Colonne numeroPoste rendue NOT NULL.");
              });
            }
          });
        });
      } else {
        console.log("✅ La colonne numeroPoste existe déjà.");
      }
    });
  },

  findBynumeroPoste: (numeroPoste, callback) => {
    const sql = 'SELECT * FROM utilisateurs WHERE numeroPoste = ?';
    db.query(sql, [numeroPoste], callback);
  },

  createWithHashedPassword: async (utilisateur, callback) => {
    try {
      const hashedPassword = await bcrypt.hash(utilisateur.motDePasse, 10);
      const sql = 'INSERT INTO utilisateurs (nom, prenom, numeroPoste, motDePasse, role) VALUES (?, ?, ?, ?, ?)';
      const values = [
        utilisateur.nom,
        utilisateur.prenom,
        utilisateur.numeroPoste,
        hashedPassword,
        utilisateur.role || 'UTILISATEUR'
      ];
      db.query(sql, values, callback);
    } catch (err) {
      callback(err);
    }
  },

  getAll: (callback) => {
    db.query('SELECT id, nom, prenom, numeroPoste, role FROM utilisateurs', callback);
  },

  modifierUtilisateur: (id, utilisateur, callback) => {
    const query = `UPDATE utilisateurs SET nom = ?, prenom = ?, numeroPoste = ?, role = ? WHERE id = ?`;
    db.query(query, [utilisateur.nom, utilisateur.prenom, utilisateur.numeroPoste, utilisateur.role, id], callback);
  },

  supprimerUtilisateur: (id, callback) => {
    const query = `DELETE FROM utilisateurs WHERE id = ?`;
    db.query(query, [id], callback);
  },

  updateNumeroPosteFromCDR: () => {
    const dossierCDR = path.join(__dirname, '..', 'fichiers-cdr');
    const fichiers = fs.readdirSync(dossierCDR).filter(f => f.endsWith('.xlsx'));
    const numeros = new Set();

    fichiers.forEach(fichier => {
      const workbook = xlsx.readFile(path.join(dossierCDR, fichier));
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);

      data.forEach(row => {
        const lower = Object.keys(row).reduce((acc, k) => {
          acc[k.toLowerCase()] = row[k];
          return acc;
        }, {});
        const num = lower['numeroposte'] || lower['callingpartynumber'];
        if (num && typeof num === 'string' && num !== 'INTERNE_PT' && num !== 'VARCHAR(50)') {
          numeros.add(num.trim());
        }
      });
    });

    const numeroPostes = Array.from(numeros);
    console.log(`📌 Numéros extraits : ${numeroPostes.length}`);

    numeroPostes.forEach(numero => {
      const sql = `
        INSERT INTO utilisateurs (nom, prenom, numeroPoste, motDePasse, role)
        VALUES ('-', '-', ?, '-', 'UTILISATEUR')
        ON DUPLICATE KEY UPDATE numeroPoste = VALUES(numeroPoste)
      `;
      db.query(sql, [numero], (err) => {
        if (err) console.error(`❌ Erreur insertion/màj pour ${numero} :`, err.message);
        else console.log(`✅ numéroPoste inséré ou mis à jour : ${numero}`);
      });
    });
  }
};

Utilisateur.createTable();
Utilisateur.updateTable();

module.exports = Utilisateur;
const db = require('../db');
const bcrypt = require('bcrypt');

const Utilisateur = {
    createTable: () => {
        const query = `
            CREATE TABLE IF NOT EXISTS utilisateurs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(100) NOT NULL,
                prenom VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                motDePasse VARCHAR(255) NOT NULL,
                role ENUM('ADMIN', 'UTILISATEUR') DEFAULT 'UTILISATEUR' NOT NULL
            )
        `;
        db.query(query, (err) => {
            if (err) console.error("❌ Erreur création table utilisateurs :", err);
            else console.log("✅ Table utilisateurs prête !");
        });
    },

    createWithHashedPassword: async (utilisateur, callback) => {
        try {
            const hashedPassword = await bcrypt.hash(utilisateur.motDePasse, 10);
            const query = `INSERT INTO utilisateurs (nom, prenom, email, motDePasse, role) VALUES (?, ?, ?, ?, ?)`;
            db.query(query, [utilisateur.nom, utilisateur.prenom, utilisateur.email, hashedPassword, utilisateur.role], callback);
        } catch (err) {
            callback(err, null);
        }
    },

    findByEmail: (email, callback) => {
        const query = 'SELECT * FROM utilisateurs WHERE email = ?';
        db.query(query, [email], callback);
    },

   

    getAll: (callback) => {
        db.query('SELECT id, nom, prenom, email, role FROM utilisateurs', callback);
    }
};

// Créer la table au démarrage
Utilisateur.createTable();

module.exports = Utilisateur;

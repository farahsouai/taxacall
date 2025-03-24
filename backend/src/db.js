const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',  // Adresse du serveur MySQL
    user: 'root',       // Utilisateur MySQL (par défaut : root)
    password: '',       // Mot de passe (laisser vide si XAMPP)
    port: 3307,
    database: 'montaxacall'  // Nom de ta base de données
    
});

// Vérifier la connexion
connection.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à MySQL :', err);
        return;
    }
    console.log('Connexion réussie à la base de données MySQL ✅');
});



module.exports = connection;

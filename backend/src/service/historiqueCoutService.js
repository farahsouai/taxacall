const mysql = require("mysql2/promise");

const dbConfig = {
    host: 'localhost',  // Adresse du serveur MySQL
    user: 'root',       // Utilisateur MySQL (par défaut : root)
    password: '',       // Mot de passe (laisser vide si XAMPP)
    port: 3307,
    database: 'montaxacall'  // Nom de ta base de données
};

exports.calculerEtSauvegarder = async (mois, utilisateur_id) => {
    const connection = await mysql.createConnection(dbConfig);
  
    // Valeur de test (tu peux changer le total)
    const total = 12.345;
  
    await connection.execute(`
     INSERT INTO historique_cout (mois, utilisateur_id, total)

      VALUES (?,?, ?)
      ON DUPLICATE KEY UPDATE total = VALUES(total)
    `, [mois, utilisateur_id, total]);
  
    await connection.end();
  
    return { mois, utilisateur_id, total };
  };
  
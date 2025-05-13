const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const db = require('../db');

const dossierCDR = path.join(__dirname, '../fichiers-cdr');
const dossierExport = path.join(__dirname, '../data');

const Appel = {};

Appel.createTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS appels (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date_appel DATE,
      numeroPoste VARCHAR(10),
      operateur VARCHAR(50),
      duree INT,
      cout DECIMAL(10,2),
      nom VARCHAR(100),
      prenom VARCHAR(100),
      filiale VARCHAR(100),
      type_appel VARCHAR(20),
      direction_appel VARCHAR(20),
      mois INT,
      annee INT,
      filiale_id INT,
      FOREIGN KEY (filiale_id) REFERENCES filiales(id)
    )
  `;
  db.query(sql, (err) => {
    if (err) throw err;
    console.log("✅ Table appels prête !");
    Appel.importCDRs();
  });
};

Appel.importCDRs = () => {
  const fichiersCDR = fs.readdirSync(dossierCDR).filter(f => f.endsWith('.xlsx'));
  const fichiersExport = fs.readdirSync(dossierExport).filter(f => /^export.*\.xlsx$/i.test(f));

  const tousFichiers = [
    ...fichiersCDR.map(f => path.join(dossierCDR, f)),
    ...fichiersExport.map(f => path.join(dossierExport, f))
  ];

  tousFichiers.forEach(filePath => {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(`📊 ${path.basename(filePath)} contient ${data.length} lignes`);
    if (data.length > 0) console.log("✅ Exemple ligne :", data[0]);

    let totalInsertions = 0;
    let insertionsDone = 0;

    data.forEach(row => {
      const numeroPoste = row.numeroPoste || row.callingPartyNumber || row.Poste || row.poste;
      const date_appel = new Date();
      const mois = date_appel.getMonth() + 1;
      const annee = date_appel.getFullYear();

      const duree = parseInt(row.duree || row.duration) || 0;
      const cout = duree ? parseFloat((duree * 0.02).toFixed(2)) : 0;

      if (!numeroPoste || isNaN(duree) || isNaN(cout)) {
        console.warn('⚠️ Ligne ignorée (données invalides) :', row);
        return;
      }

  let operateur = row.operateur || row.Operateur || row['Opérateur'] || null;
if (typeof operateur === 'string') {
  // Nettoyage des virgules s'il y a plusieurs opérateurs
  operateur = operateur.split(',')[0].trim();
}


      const nom = row.nom || row.Nom || "-";
      const prenom = row.prenom || row.Prenom || row.Prénom || "-";
      const filiale = row.filiale || "-";
      const type_appel = row.type || "National";
      const direction = (row.direction || row.direction_appel || row['sens'] || '').toLowerCase();
     const direction_appel = direction.includes('entrant') ? 'entrant'
                           : direction.includes('sortant') ? 'sortant'
                           : 'entrant';'sortant'; // valeur par défaut

      const sql = `
        INSERT INTO appels 
        (date_appel, numeroPoste, operateur, duree, cout, nom, prenom, filiale, type_appel, direction_appel, mois, annee)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      totalInsertions++;
      db.query(sql, [
        date_appel, numeroPoste.toString().trim(), operateur, duree,
        cout, nom.trim(), prenom.trim(), filiale, type_appel, direction_appel,
        mois, annee
      ], (err) => {
        insertionsDone++;
        if (err) console.error("❌ Erreur insertion appel :", err.message);
        if (insertionsDone === totalInsertions) {
          console.log("✅ Insertions terminées pour", path.basename(filePath));
          enrichirAppelsAvecUtilisateurs();
        }
      });
    });
  });
};

function enrichirAppelsAvecUtilisateurs() {
  const sql = `
    UPDATE appels a
    JOIN utilisateurs_poulina u ON a.numeroPoste = u.numeroPoste
    SET 
      a.nom = u.nom,
      a.prenom = u.prenom,
      a.filiale = u.filiale,
      a.filiale_id = u.filiale_id
    WHERE a.nom IS NULL OR a.nom = '-'
  `;

  db.query(sql, (err, result) => {
    if (err) console.error("❌ Erreur enrichissement appels :", err.message);
    else console.log(`✅ Appels enrichis avec utilisateurs (${result.affectedRows} lignes mises à jour)`);
  });
}

module.exports = Appel;

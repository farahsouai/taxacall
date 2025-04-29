const appelNationauxDB = require('./model/initAppelNationauxDB');

appelNationauxDB.insertAppel({
  numeroPoste: '548962',
  dateAppel: '2025-03-06 15:20:00',
  duree: 300,
  numero: '98765432',
  cout: 3.8,
  operateur: 'Tunisie Telecom',
  typeAppel: 'INTERNATIONAL'
}, (err, result) => {
  if (err) {
    console.log("❌ Erreur ➤", err);
  } else {
    console.log("✅ Appel bien inséré !");
  }
});

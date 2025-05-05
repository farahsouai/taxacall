const express = require('express');
const app = express();
const port = 3005;
const db = require('./db');
const utilisateurRoutes = require('./routes/utilisateurRoutes');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const appelRoutes = require('./routes/appelRoutes');
const filialeModel = require('./model/initFilialeDB');
const appelModel = require('./model/initAppelDB');
const budgetRoutes = require('./routes/budgetRoutes');
const budgetModel = require('./model/budget');
const appelNationauxDB = require('./model/initAppelNationauxDB');
const appelInternationauxDB = require('./model/initAppelInternationauxDB');
const filialeRoutes = require('./routes/filialeRoutes');
const factureModel = require('./model/initFactureDB');
const gatewayModel = require('./model/initGatewayDB');
const prefixeModel = require('./model/initPrefixeDB');
const gatewayRoutes = require('./routes/gatewayRoutes');
const prefixeRoutes = require('./routes/prefixeRoutes');
const utilisateursPoulinaDB = require('./model/utilisateursPoulinaDB');
const utilisateursPoulinaRoutes = require('./routes/utilisateursPoulinaRoutes');
const factureRoutes = require('./routes/facturesRoutes');
const Alerte = require('./model/alerte');
const alerteRoutes = require('./routes/alerteRoutes');
const appellisteRoutes = require('./routes/appellisteRoutes');
const historiqueCoutModel = require('./model/initHistoriqueCoutDB');
const journalappelsRoutes = require('./routes/journalappelsRoutes');
const historiqueCoutRoutes = require('./routes/historiqueCoutRoutes');


app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/budget', budgetRoutes);
app.use('/utilisateurs', utilisateurRoutes);
app.use('/auth', authRoutes);
app.use('/api', filialeRoutes);
app.use('/api/gateways', gatewayRoutes);
app.use('/api/prefixes', prefixeRoutes);
app.use('/api/utilisateurs-poulina', utilisateursPoulinaRoutes);
app.use('/api/factures', factureRoutes);
app.use('/api/alertes', alerteRoutes);
app.use('/api/appelliste', appellisteRoutes);
app.use('/api', historiqueCoutRoutes);
app.use('/api/filiales', filialeRoutes);
app.use('/api/appel', appelRoutes);
app.use('/api', journalappelsRoutes);


app.get('/', (req, res) => {
  res.send(`
    <h1>Bienvenue sur mon serveur Express!</h1>
    <p>✅ Serveur connecté à la base de données "mon_taxacall" !</p>
    <p>Table "utilisateurs" prête. !</p>
  `);
});

app.patch('/api/factures/:id', (req, res) => {
  const { id } = req.params;
  const { mois, annee, montant_total, format } = req.body;

  factureModel.updateFacture(id, { mois, annee, montant_total, format }, (err, result) => {
    if (err) {
      console.error("❌ Erreur lors de la mise à jour :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    res.status(200).json({ message: "Facture mise à jour avec succès" });
  });
});

console.log(app._router.stack.filter(r => r.route).map(r => r.route.path));

filialeModel.createTable();
setTimeout(() => appelModel.createTable(), 2000);
appelNationauxDB.createTable();
appelInternationauxDB.createTable();
factureModel.createTable();
gatewayModel.createTable();
prefixeModel.createTable();
utilisateursPoulinaDB.createTable();
utilisateursPoulinaDB.updateNumerosPosteFromCDR();
Alerte.createTable();
historiqueCoutModel.createTable();
appelModel.createTable();
budgetModel.createTable(); // 👈 Là tu peux l’utiliser
setTimeout(() => {
  budgetModel.updateBudgetsFromCDR(); // 👈 Et ici aussi
}, 1500);


factureModel.createTable();
setTimeout(() => {
  factureModel.seedFactures(); // ← CETTE LIGNE DOIT ÊTRE ACTIVE
}, 2000);


setTimeout(() => {
  historiqueCoutModel.insertFromCDRFiles();
}, 1000);
factureModel.getAllWithUser((err, result) => {
  if (err) {
    console.error("❌ Erreur lors du listing des factures :", err);
  } else if (Array.isArray(result)) {
    console.table(result);
  } else {
    console.log("ℹ️ Pas de factures à afficher.");
  }
});


app.listen(port, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
});

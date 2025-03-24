const express = require('express');
const app = express();
const port = 3001;
const db = require('./db');
const utilisateurRoutes = require('./routes/utilisateurRoutes');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');




app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));


app.get('/', (req, res) => { 
    res.send(`
        <h1>Bienvenue sur mon serveur Express!</h1>
        <p>✅ Serveur connecté à la base de données "mon_taxacall" !</p>
        <p>Table "utilisateurs" prête. !</p>
    `);
});

app.use('/utilisateurs', utilisateurRoutes);
app.use('/auth', authRoutes); 

console.log(app._router.stack
    .filter(r => r.route)
    .map(r => r.route.path));
  


app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});

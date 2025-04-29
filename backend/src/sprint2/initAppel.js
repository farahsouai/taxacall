//ce fichier initialise la table et les données
// src/sprint2/initAppel.js

const Appel = require('../model/appel');  // importe les fonctions liées à la table Appel

// ✅ Crée la table si elle n'existe pas
Appel.createTable();

// ✅ Insère une donnée test pour vérifier que tout marche
Appel.insertSample();

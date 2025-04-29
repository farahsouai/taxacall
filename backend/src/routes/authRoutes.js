const express = require('express');
const bcrypt = require('bcrypt');
const Utilisateur = require('../model/utilisateur');

const router = express.Router();

// ✅ Enregistrement (POST /auth/register)
router.post('/register', (req, res) => {
    console.log('📦 Données reçues (register) :', req.body);

    const { nom, prenom, numeroPoste, motDePasse, role } = req.body;

    if (!nom || !prenom || !numeroPoste || !motDePasse) {
        return res.status(400).json({ error: "Champs requis manquants" });
    }

    Utilisateur.findBynumeroPoste(numeroPoste, (err, users) => {
        if (err) return res.status(500).json({ error: "Erreur serveur" });
        if (users.length > 0) {
            return res.status(409).json({ error: "numeroPoste déjà utilisé" });
        }

        Utilisateur.createWithHashedPassword({
          nom,
          prenom,
          numeroPoste: numeroPoste,
          motDePasse: motDePasse,
          role: role || 'UTILISATEUR'
        }, (err2, result) => {
          if (err2) {
            console.error("❌ Erreur SQL détaillée :", err2);
            console.error("Erreur lors de l'insertion :", err2);
            return res.status(500).json({ error: "Erreur lors de l'insertion" });
          }
          res.status(201).json({ message: "Utilisateur inscrit avec succès" });
        });
    });
});

// ✅ Connexion (POST /auth/login)
router.post('/login', (req, res) => {
    console.log('🟡 Données reçues:', req.body);

    const { numeroPoste, motDePasse } = req.body;

    if (!numeroPoste || !motDePasse) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    Utilisateur.findBynumeroPoste(numeroPoste, async (err, users) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });
      if (users.length === 0) return res.status(401).json({ error: 'numeroPoste incorrect' });

      const user = users[0];

      const isValid = await bcrypt.compare(motDePasse, user.motDePasse);
      if (!isValid) return res.status(401).json({ error: 'Mot de passe incorrect' });

      res.json({
        message: 'Connexion réussie',
        utilisateur: {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          numeroPoste: user.numeroPoste,
          role: user.role
        }
      });
    });
});

module.exports = router;

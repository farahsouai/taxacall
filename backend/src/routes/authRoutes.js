const express = require('express');
const bcrypt = require('bcrypt');
const Utilisateur = require('../model/utilisateur');

const router = express.Router();

// ✅ Enregistrement (POST /auth/register)
router.post('/register', (req, res) => {
    console.log('📦 Données reçues (register) :', req.body);

    const { nom, prenom, email, motDePasse, role } = req.body;

    if (!nom || !prenom || !email || !motDePasse) {
        return res.status(400).json({ error: "Champs requis manquants" });
    }

    Utilisateur.findByEmail(email, (err, users) => {
        if (err) return res.status(500).json({ error: "Erreur serveur" });
        if (users.length > 0) {
            return res.status(409).json({ error: "Email déjà utilisé" });
        }

        Utilisateur.createWithHashedPassword({
          nom,
          prenom,
          mail: email,          // ⚠️ ta colonne s'appelle `mail`
          mot_passe: motDePasse, // ⚠️ ta colonne s'appelle `mot_passe`
          role: role || 'UTILISATEUR'
        }, (err2, result) => {
          if (err2) {
            console.error("❌ Erreur SQL détaillée :", err2); // <- Ajoute cette ligne
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
      
       
            const { email, motDePasse } = req.body;
          
            if (!email || !motDePasse) {
              return res.status(400).json({ error: 'Champs requis manquants' });
            }
          
            Utilisateur.findByEmail(email, async (err, users) => {
              if (err) return res.status(500).json({ error: 'Erreur serveur' });
              if (users.length === 0) return res.status(401).json({ error: 'Email incorrect' });
          
              const user = users[0];
          
              const isValid = await bcrypt.compare(motDePasse, user.motDePasse);
              if (!isValid) return res.status(401).json({ error: 'Mot de passe incorrect' });
          
              res.json({
                message: 'Connexion réussie',
                utilisateur: {
                  id: user.id,
                  nom: user.nom,
                  role: user.role
                }
              });
            });
          });
          
module.exports = router;

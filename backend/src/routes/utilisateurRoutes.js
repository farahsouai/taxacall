const express = require('express');
const bcrypt = require('bcrypt');
const Utilisateur = require('../model/utilisateur');

const router = express.Router();

// ✅ Ajouter un utilisateur (POST /utilisateur)
router.post('/', (req, res) => {
    const { nom, prenom, email, motDePasse, role } = req.body;

    if (!nom || !prenom || !email || !motDePasse) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    const validRoles = ["ADMIN", "UTILISATEUR"];
    if (role && !validRoles.includes(role.toUpperCase())) {
        return res.status(400).json({ error: "Le rôle doit être ADMIN ou UTILISATEUR" });
    }

    const utilisateur = {
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim(),
        motDePasse: motDePasse.trim(),
        role: role ? role.trim().toUpperCase() : 'UTILISATEUR'
    };

    Utilisateur.createWithHashedPassword(utilisateur, (err, result) => {
        if (err) {
            console.error('❌ Erreur lors de l\'insertion :', err);
            return res.status(500).json({ error: 'Erreur serveur', details: err.sqlMessage });
        }
        res.status(201).json({ message: 'Utilisateur ajouté avec succès' });
    });
});

module.exports = router;

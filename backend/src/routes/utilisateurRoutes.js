const express = require('express');
const bcrypt = require('bcrypt');
const Utilisateur = require('../model/utilisateur');
const db = require('../db');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');

const router = express.Router();

// ✅ Liste des numeroPoste extraits des fichiers CDR
router.get('/numeros-cdr', (req, res) => {
  try {
    const dossierCDR = path.join(__dirname, '..', 'fichiers-cdr');
    const fichiers = fs.readdirSync(dossierCDR).filter(f => f.endsWith('.xlsx'));
    const numeros = new Set();

    fichiers.forEach(fichier => {
      const workbook = xlsx.readFile(path.join(dossierCDR, fichier));
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);

      data.forEach(row => {
        const lower = Object.fromEntries(Object.entries(row).map(([k, v]) => [k.toLowerCase(), v]));
        const num = lower['numeroposte'] || lower['callingpartynumber'];
        if (num && typeof num === 'string' && num !== 'INTERNE_PT' && num !== 'VARCHAR(50)') {
          numeros.add(num.trim());
        }
      });
    });

    res.json(Array.from(numeros));
  } catch (error) {
    console.error("❌ Erreur extraction numeros CDR :", error);
    res.status(500).json({ error: 'Erreur extraction CDR' });
  }
});

// ✅ Ajouter un utilisateur
router.post('/', (req, res) => {
  const { nom, prenom, numeroPoste, motDePasse, role } = req.body;

  if (!nom || !prenom || !numeroPoste || !motDePasse) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  const validRoles = ["ADMIN", "UTILISATEUR"];
  if (role && !validRoles.includes(role.toUpperCase())) {
    return res.status(400).json({ error: "Le rôle doit être ADMIN ou UTILISATEUR" });
  }

  const utilisateur = {
    nom: nom.trim(),
    prenom: prenom.trim(),
    numeroPoste: numeroPoste.trim(),
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

// ✅ Récupérer tous les utilisateurs
router.get('/', (req, res) => {
  Utilisateur.getAll((err, utilisateurs) => {
    if (err) {
      console.error("❌ Erreur récupération utilisateurs :", err);
      return res.status(500).json({ error: "Erreur serveur", details: err });
    }
    res.status(200).json(utilisateurs);
  });
});

// ✅ Récupérer un utilisateur par ID
router.get('/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'SELECT * FROM utilisateurs WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    if (results.length === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(results[0]);
  });
});

// ✅ Modifier un utilisateur
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { nom, prenom, numeroPoste, role } = req.body;

  const sql = `UPDATE utilisateurs SET nom = ?, prenom = ?, numeroPoste = ?, role = ? WHERE id = ?`;
  db.query(sql, [nom, prenom, numeroPoste, role, id], (err, result) => {
    if (err) {
      console.error("❌ Erreur SQL :", err);
      return res.status(500).json({ error: "Erreur lors de la mise à jour" });
    }
    res.json({ message: "Utilisateur mis à jour avec succès" });
  });
});

// ✅ Supprimer un utilisateur
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  Utilisateur.supprimerUtilisateur(id, (err, result) => {
    if (err) {
      console.error('❌ Erreur suppression utilisateur :', err);
      return res.status(500).json({ error: 'Erreur serveur', details: err });
    }
    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  });
});

module.exports = router;

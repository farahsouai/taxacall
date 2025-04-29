const Appel = require('../model/appel');

// 👉 Ajouter un appel
exports.ajouterAppel = (req, res) => {
  const appel = req.body;
  Appel.create(appel, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la création', details: err });
    }
    res.status(201).json({ message: 'Appel ajouté avec succès' });
  });
};

// 👉 Filtrer les appels (US3)
exports.filtrerAppels = (req, res) => {
  Appel.findWithFilters(req.query, (err, appels) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur', details: err });
    }
    res.status(200).json(appels);
  });
};


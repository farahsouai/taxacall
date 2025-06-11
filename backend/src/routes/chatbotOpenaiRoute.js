const express = require('express');
const router = express.Router();

const knowledgeBase = [
  {
    questionKeywords: ['appel', 'passer', 'reçu', 'journal'],
    response: "Vous pouvez consulter les appels passés et reçus dans la section « Appels ». 📞\n👉 [Accéder aux appels](http://localhost:3000/home#appels)"
  },
  {
    questionKeywords: ['coût', 'historique', 'mensuel'],
    response: "L'historique des coûts par mois est disponible pour chaque utilisateur.\n👉 [Voir l’historique](http://localhost:3000/home#historique)"
  },
  {
    questionKeywords: ['coûteux', 'chers', 'plus cher', 'plus coûteux'],
    response: "Les appels les plus coûteux ce mois-ci sont affichés dans le tableau de bord.\n👉 [Voir le tableau de bord](http://localhost:3000/home)"

  },
  {
    questionKeywords: ['facture', 'facturation'],
    response: "La section « Facturation » vous permet de visualiser les factures générées automatiquement.\n👉 [Accéder à la facturation](http://localhost:3000/home#facturation)"
  },
  {
    questionKeywords: ['budget', 'dépassé', 'solde'],
    response: "Chaque utilisateur possède un budget mensuel avec suivi.\n👉 [Voir mon budget](http://localhost:3000/home#budget)"
  },
  {
    questionKeywords: ['alerte', 'notification'],
    response: "Les alertes sont visibles par l’administrateur en cas de dépassement de seuil ou d'appels manqués.\n👉 [Voir les alertes](http://localhost:3000/home#alertes)"
  },
  {
    questionKeywords: ['redirection', 'rediriger'],
    response: "La redirection d’appel permet de suivre un appel transféré entre agents.\n👉 [Accéder aux redirections](http://localhost:3000/home#redirections)"
  },
  {
    questionKeywords: ['utilisateur', 'ajouter', 'gérer', 'modifier'],
    response: "La gestion des utilisateurs se fait via la section Admin.\n👉 [Gérer les utilisateurs](http://localhost:3000/home#utilisateurs)"
  },
  {
    questionKeywords: ['poste', 'numéro'],
    response: "Chaque utilisateur est associé à un numéro de poste utilisé pour les appels et la facturation."
  },
  {
    questionKeywords: ['seuil'],
    response: "Un seuil peut être défini. Si un utilisateur le dépasse, une alerte est déclenchée."
  },
  {
    questionKeywords: ['bonjour', 'salut'],
    response: "Bonjour 👋 ! Je suis l’assistant TaxaCall. Posez-moi une question sur les appels, la facturation, le budget ou les utilisateurs."
  }
];


router.post('/chatbot/ask', (req, res) => {
  const { question } = req.body;
  const lowerQ = question.toLowerCase();

  for (const entry of knowledgeBase) {
    if (entry.questionKeywords.some(kw => lowerQ.includes(kw))) {
      return res.json({ answer: entry.response });
    }
  }

  return res.json({ answer: "❌ Fonctionnalité non reconnue. Posez une question sur les appels, la facturation, les utilisateurs, etc." });
});

module.exports = router;

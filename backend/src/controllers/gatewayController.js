const db = require('../db');

const getGatewaysWithUsers = (req, res) => {
  const sql = `
    SELECT 
      g.description AS gateway,
      u.nom,
      u.prenom,
      u.numeroPoste,
      u.mail,
      u.groupe
    FROM gateways g
    JOIN utilisateurs_poulina u ON g.groupe = u.groupe
    ORDER BY g.description
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Erreur récupération des gateways avec utilisateurs :", err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(results);
  });
};

const getGatewayByIp = (req, res) => {
  const ip = req.params.ip;

  const sqlGateway = `SELECT * FROM gateways WHERE ip = ?`;
  db.query(sqlGateway, [ip], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur SQL', details: err });

    const gateway = result[0];
    if (!gateway) return res.status(404).json({ error: 'Gateway non trouvée' });

    const sqlUsers = `SELECT * FROM utilisateurs_poulina WHERE groupe = ?`;
    db.query(sqlUsers, [gateway.groupe], (err2, users) => {
      if (err2) return res.status(500).json({ error: 'Erreur SQL utilisateurs', details: err2 });

      gateway.utilisateurs = users;
      res.json(gateway);
    });
  });
};

module.exports = {
  getGatewaysWithUsers,
  getGatewayByIp // ✅ Manquait ici
};

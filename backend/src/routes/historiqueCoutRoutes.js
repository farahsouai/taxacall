const express = require("express");
const router = express.Router();
const historiqueCoutController = require("../controllers/historiqueCoutController");

router.get("/historique-cout", historiqueCoutController.getHistoriqueCout);

module.exports = router;

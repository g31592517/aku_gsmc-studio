const express = require("express");
const { getServiceCategories } = require("../controllers/serviceRequestController");

const router = express.Router();

router.get("/", getServiceCategories);

module.exports = router;

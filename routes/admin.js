const express = require("express");
const { getAllUsers } = require("../controllers/adminController");

const router = express.Router();

router.get("/user", getAllUsers);

module.exports = router;

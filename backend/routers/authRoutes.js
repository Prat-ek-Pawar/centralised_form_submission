const express = require("express");
const router = express.Router();
const { adminLogin, clientLogin, logout } = require("../controllers/authController");

router.post("/admin/login", adminLogin);
router.post("/client/login", clientLogin);
router.post("/logout", logout);
 

module.exports = router;

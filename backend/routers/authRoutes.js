const express = require("express");
const router = express.Router();
const { adminLogin, clientLogin, logout, registerAdmin } = require("../controllers/authController");

router.post("/admin/login", adminLogin);
router.post("/client/login", clientLogin);
router.post("/logout", logout);
router.post("/admin/register", registerAdmin); 

module.exports = router;

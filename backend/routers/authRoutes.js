const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const {
  adminLogin,
  clientLogin,
  logout,
} = require("../controllers/authController");

router.post("/admin/login", adminLogin);
router.post("/client/login", clientLogin);
router.post("/logout", logout);

// Token validation endpoint
router.get("/me", (req, res) => {
  let token;

  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ valid: false, message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, "your_secret_key");
    return res.json({ valid: true, user: decoded });
  } catch (error) {
    return res.status(401).json({ valid: false, message: "Invalid token" });
  }
});

module.exports = router;

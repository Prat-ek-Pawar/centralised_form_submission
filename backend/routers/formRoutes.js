const express = require("express");
const router = express.Router();
const { submitForm, getMySubmissions } = require("../controllers/formControllers");
const { protect } = require("../middleware/authMiddleware");

router.post("/submit/:clientID", submitForm);

router.get("/my-submissions", protect, getMySubmissions);

module.exports = router;

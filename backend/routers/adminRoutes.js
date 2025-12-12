const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { 
    getAllClients, createClient, updateClient, deleteClient,
    getAllSubmissions, getSubmissionsByClient, updateSubmission, deleteSubmission,
    toggleClientAccess
} = require("../controllers/adminController");

router.use(protect);
router.use(adminOnly);

router.get("/clients", getAllClients);
router.post("/clients", createClient);
router.put("/clients/:id", updateClient);
router.delete("/clients/:id", deleteClient);
router.put("/clients/:id/toggle-access", toggleClientAccess);

router.get("/submissions", getAllSubmissions);
router.get("/submissions/client/:clientID", getSubmissionsByClient);
router.put("/submissions/:id", updateSubmission);
router.delete("/submissions/:id", deleteSubmission);

module.exports = router;

const Client = require("../models/clientCreationModel");
const FormSubmission = require("../models/formSubmission");
const Admin = require("../models/adminModel");

const getAllClients = async (req, res) => {
    try {
        const clients = await Client.find({}).select("-password");
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createClient = async (req, res) => {
    try {
        const { userName, email, password } = req.body;
        
        const clientExists = await Client.findOne({ $or: [{ email }, { userName }] });
        if (clientExists) {
            return res.status(400).json({ message: "Client already exists" });
        }

        const client = await Client.create({
            userName,
            email,
            password 
        });

        res.status(201).json(client);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateClient = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);

        if (client) {
            client.userName = req.body.userName || client.userName;
            client.email = req.body.email || client.email;
            if (req.body.password) {
                client.password = req.body.password;
            }

            const updatedClient = await client.save();
            res.json(updatedClient);
        } else {
            res.status(404).json({ message: "Client not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteClient = async (req, res) => {
    try {
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({ message: "Admin password is required to delete a client" });
        }

        const admin = await Admin.findById(req.user.id);

        if (!admin || !(await admin.matchPassword(password))) {
            return res.status(403).json({ message: "Incorrect admin password" });
        }

        const client = await Client.findById(req.params.id);

        if (client) {
            await FormSubmission.deleteMany({ clientID: client.clientID });
            
            await Client.deleteOne({ _id: req.params.id }); 
            res.json({ message: "Client removed" });
        } else {
            res.status(404).json({ message: "Client not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllSubmissions = async (req, res) => {
    try {
        const submissions = await FormSubmission.find({});
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSubmissionsByClient = async (req, res) => {
    try {
        const submissions = await FormSubmission.find({ clientID: req.params.clientID });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateSubmission = async (req, res) => {
    try {
        const submission = await FormSubmission.findById(req.params.id);
        if (submission) {
            submission.data = req.body.data || submission.data;
            const updatedSubmission = await submission.save();
            res.json(updatedSubmission);
        } else {
            res.status(404).json({ message: "Submission not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteSubmission = async (req, res) => {
    try {
        const submission = await FormSubmission.findById(req.params.id);
        if (submission) {
            await FormSubmission.deleteOne({ _id: req.params.id });
            res.json({ message: "Submission removed" });
        } else {
            res.status(404).json({ message: "Submission not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleClientAccess = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (client) {
            client.isLocked = !client.isLocked;
            const updatedClient = await client.save();
            res.json({ 
                message: `Client access ${updatedClient.isLocked ? "locked" : "unlocked"}`, 
                isLocked: updatedClient.isLocked 
            });
        } else {
            res.status(404).json({ message: "Client not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllClients,
    createClient,
    updateClient,
    deleteClient,
    getAllSubmissions,
    getSubmissionsByClient,
    updateSubmission,
    deleteSubmission,
    toggleClientAccess
};

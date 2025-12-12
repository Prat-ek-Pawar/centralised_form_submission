const FormSubmission = require("../models/formSubmission");
const Client = require("../models/clientCreationModel");

async function submitForm(req, res) {
    try {
        const clientID = req.params.clientID;   
        const data = req.body;                 

        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({ error: "Form data must not be empty." });
        }

        const client = await Client.findOne({ clientID });
        if (!client) {
            return res.status(404).json({ error: "Client not found." });
        }

        const newFormSubmission = await FormSubmission.create({
            clientID,
            data
        });

        return res.status(201).json({
            message: "Form submitted successfully.",
            formSubmission: newFormSubmission
        });

    } catch (error) {
        console.error("Error submitting form:", error);
        return res.status(500).json({
            error: "Internal Server Error",
            details: error.message
        });
    }
}

async function getMySubmissions(req, res) {
    try {
        const client = req.userObj;

        if (!client) {
             return res.status(404).json({ error: "Client not found." });
        }

        if (client.isLocked) {
             return res.status(403).json({ error: "Access to submissions is locked. Please contact admin." });
        }

        const clientID = client.clientID;

        const submissions = await FormSubmission.find({ clientID });
        res.status(200).json(submissions);
    } catch (error) {
         res.status(500).json({ error: error.message });
    }
}

module.exports = {
    submitForm,
    getMySubmissions
};

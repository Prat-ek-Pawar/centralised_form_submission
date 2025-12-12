const Client = require("../models/clientCreationModel");
const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

async function createClient(req, res) {
    try {
        const { userName, email, password } = req.body;

        if (!userName || !email || !password) {
            return res.status(400).json({ error: "userName, email, and password are required." });
        }

        const existingClient = await Client.findOne({ email });
        if (existingClient) {
            return res.status(400).json({ error: "Email already registered." });
        }

        const clientID = uuidv4();

        const newClient = new Client({
            userName,
            email,
            password,
            clientID
        });

        await newClient.save();

        router.post(`/form/${clientID}`, async (req, res) => {
            const { data } = req.body;

            if (!data) {
                return res.status(400).json({ error: "Form data is required." });
            }

            return res.status(200).json({
                message: `Form submitted successfully for client ${clientID}`,
                formData: data
            });
        });

        return res.status(201).json({
            message: "Client created successfully",
            clientID: newClient.clientID,
            formAPI: `/form/${clientID}`
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error creating client: " + error.message });
    }
}
 
async function getAllClients(req, res) {
    try {
        const clients = await Client.find({}).select('clientID userName'); 
        return res.status(200).json(clients);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error fetching clients: " + error.message });
    }
}


module.exports = {
    createClient,
    getAllClients
};

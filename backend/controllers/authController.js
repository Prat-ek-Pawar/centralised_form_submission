const Admin = require("../models/adminModel");
const Client = require("../models/clientCreationModel");
const jwt = require("jsonwebtoken");

const generateToken = (id, role, clientID = null) => {
    return jwt.sign({ id, role, clientID }, "your_secret_key", {
        expiresIn: "30d",
    });
};

const adminLogin = async (req, res) => {
    try {
        const { userName, password } = req.body;
        const admin = await Admin.findOne({ userName });

        if (admin && (await admin.matchPassword(password))) {
            const token = generateToken(admin._id, "admin");
            
            res.cookie("jwt", token, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            res.json({
                success: true,
                message: "Admin logged in",
                role: "admin",
                user: {
                    id: admin._id,
                    userName: admin.userName,
                    email: admin.email
                }
            });
        } else {
            res.status(401).json({ message: "Invalid admin credentials" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const clientLogin = async (req, res) => {
    try {
        const { userName, password } = req.body;
        const client = await Client.findOne({ userName });

        if (client && (await client.matchPassword(password))) {
            
            if (client.isLocked) {
                return res.status(403).json({ message: "Account is locked. Please contact admin." });
            }

            const token = generateToken(client._id, "client", client.clientID);

            res.cookie("jwt", token, {
                httpOnly: true,
                secure: false, 
                sameSite: "strict",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            res.json({
                success: true,
                message: "Client logged in",
                role: "client",
                user: {
                    id: client._id,
                    clientID: client.clientID,
                    userName: client.userName,
                    email: client.email
                }
            });
        } else {
            res.status(401).json({ message: "Invalid client credentials" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const logout = (req, res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: "Logged out" });
};

const registerAdmin = async (req, res) => {
    try {
        const { userName, email, password } = req.body;
        const adminExists = await Admin.findOne({ email });

        if (adminExists) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        const admin = await Admin.create({
            userName,
            email,
            password 
        });

        if (admin) {
             res.status(201).json({
                _id: admin._id,
                userName: admin.userName,
                email: admin.email,
            });
        } else {
            res.status(400).json({ message: "Invalid admin data" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    adminLogin,
    clientLogin,
    logout,
    registerAdmin
};

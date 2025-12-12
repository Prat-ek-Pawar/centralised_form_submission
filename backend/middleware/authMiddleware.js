const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
const Client = require('../models/clientCreationModel');

const protect = async (req, res, next) => {
    let token;

    if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, "your_secret_key");

        req.user = decoded;
        
        if (decoded.role === 'admin') {
            const admin = await Admin.findById(decoded.id).select('-password');
            if (!admin) return res.status(401).json({ message: 'Admin not found' });
            req.userObj = admin; 
        } else if (decoded.role === 'client') {
            const client = await Client.findById(decoded.id).select('-password');
            if (!client) return res.status(401).json({ message: 'Client not found' });
            
            if (client.isLocked) {
                return res.status(403).json({ message: 'Account is locked' });
            }

            req.userObj = client;
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as admin' });
    }
};

module.exports = { protect, adminOnly };

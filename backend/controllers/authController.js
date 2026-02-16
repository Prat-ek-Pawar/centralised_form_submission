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
    // Defensive: handle missing or malformed body
    const body = req.body || {};
    const userName = body.userName;
    const password = body.password;

    if (!userName || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const admin = await Admin.findOne({
      $or: [{ userName: userName }, { email: userName }],
    });

    if (!admin) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const isMatch = await admin.matchPassword(String(password));

    if (isMatch) {
      const token = generateToken(admin._id, "admin");

      res.cookie("jwt", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        message: "Admin logged in",
        role: "admin",
        token: token,
        user: {
          id: admin._id,
          userName: admin.userName,
          email: admin.email,
        },
      });
    } else {
      res.status(401).json({ message: "Invalid admin credentials" });
    }
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Login failed: " + error.message });
  }
};

const clientLogin = async (req, res) => {
  try {
    // Defensive: handle missing or malformed body
    const body = req.body || {};
    const userName = body.userName;
    const password = body.password;

    if (!userName || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const client = await Client.findOne({
      $or: [{ userName: userName }, { email: userName }],
    });

    if (!client) {
      return res.status(401).json({ message: "Invalid client credentials" });
    }

    if (client.isLocked) {
      return res
        .status(403)
        .json({ message: "Account is locked. Please contact admin." });
    }

    const isMatch = await client.matchPassword(String(password));

    if (isMatch) {
      const token = generateToken(client._id, "client", client.clientID);

      res.cookie("jwt", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        message: "Client logged in",
        role: "client",
        token: token,
        user: {
          id: client._id,
          clientID: client.clientID,
          userName: client.userName,
          email: client.email,
        },
      });
    } else {
      res.status(401).json({ message: "Invalid client credentials" });
    }
  } catch (error) {
    console.error("Client login error:", error);
    res.status(500).json({ message: "Login failed: " + error.message });
  }
};

const logout = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out" });
};

module.exports = {
  adminLogin,
  clientLogin,
  logout,
};

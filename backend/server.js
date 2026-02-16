const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const authRoutes = require("./routers/authRoutes");
const adminRoutes = require("./routers/adminRoutes");
const formRoutes = require("./routers/formRoutes");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("database connected");

    try {
      const clientCollection = mongoose.connection.collection("clients");
      const indexes = await clientCollection.indexes();
      const problematicIndex = indexes.find(
        (idx) => idx.name === "publicKey_1",
      );

      if (problematicIndex) {
        console.log(
          "Found ghost index 'publicKey_1'. Automatically dropping it to fix E11000 error...",
        );
        await clientCollection.dropIndex("publicKey_1");
        console.log(
          "✅ Successfully dropped 'publicKey_1'. Client creation will now work.",
        );
      }
    } catch (err) {
      if (err.code !== 27 && err.codeName !== "NamespaceNotFound") {
        console.log("Auto-fix index warning:", err.message);
      }
    }
  })
  .catch((err) => {
    console.log("Error : ", err);
  });

// --- API Routes (must come before static file serving) ---
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/forms", formRoutes);

// --- Serve static files (CSS, JS, etc.) ---
app.use(express.static(path.join(__dirname, "public")));

// --- Page Routes ---
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  // If already logged in, redirect to dashboard
  let token = req.cookies.jwt;
  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (token) {
    try {
      jwt.verify(token, "your_secret_key");
      return res.redirect("/dashboard");
    } catch (e) {
      // Token invalid, show login page
    }
  }
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/dashboard", (req, res) => {
  // Server-side auth check: verify JWT before serving dashboard
  let token = req.cookies.jwt;
  if (!token && req.query.token) {
    token = req.query.token;
  }
  if (!token) {
    return res.redirect("/login");
  }

  try {
    jwt.verify(token, "your_secret_key");
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
  } catch (error) {
    return res.redirect("/login");
  }
});

const PORT = process.env.PORT || 8088;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

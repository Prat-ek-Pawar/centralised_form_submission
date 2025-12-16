const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const cookieParser = require("cookie-parser");
const cors = require("cors");  
const mongoose = require("mongoose");
const authRoutes = require("./routers/authRoutes");
const adminRoutes = require("./routers/adminRoutes");
const formRoutes = require("./routers/formRoutes");

app.use(express.json()); 
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: true, // Reflects the request origin, effectively allowing all
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
.then(async ()=>{
    console.log("database connected");
    
    // --- AUTOMATIC FIX FOR DUPLICATE KEY ERROR ---
    try {
        const clientCollection = mongoose.connection.collection("clients");
        // Check if index exists before trying to drop it
        const indexes = await clientCollection.indexes();
        const problematicIndex = indexes.find(idx => idx.name === "publicKey_1");
        
        if (problematicIndex) {
            console.log("Found ghost index 'publicKey_1'. Automatically dropping it to fix E11000 error...");
            await clientCollection.dropIndex("publicKey_1");
            console.log("✅ Successfully dropped 'publicKey_1'. Client creation will now work.");
        }
    } catch (err) {
        // Ignore "index not found" or "namespace not found" errors, as they mean we are safe
        if (err.code !== 27 && err.codeName !== 'NamespaceNotFound') {
            console.log("Auto-fix index warning:", err.message);
        }
    }
    // ---------------------------------------------

}).catch((err)=>{
    console.log("Error : ",err)
})


app.get("/", (req, res) => {
    res.send("API is running successfully. backend"); 
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/forms", formRoutes);


app.listen(8088, () => {
    console.log("Server running on port 8088");
});

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
    origin: ["https://forms.thedigitechsolutions.com", "https://dev.thedigitechsolutions.com", "http://localhost:5500", "http://127.0.0.1:5500", "https://thedigitech.com", "https://www.thedigitech.com"], 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{
    console.log("database connected")
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

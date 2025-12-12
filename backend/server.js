const express = require("express");
const app = express();
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
    origin: true, 
    credentials: true 
}));

mongoose.connect("mongodb://localhost:27017/digitech-dashboard").then(()=>{
    console.log("database connected")
}).catch((err)=>{
    console.log("Error : ",err)
})

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/forms", formRoutes);


app.listen(8088, () => {
    console.log("Server running on port 8088");
});

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Admin = require("./models/adminModel");

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected for seeding");

        const existingAdmin = await Admin.findOne({ email: "admin@thedigitechsolutions.com" });

        if (existingAdmin) {
            console.log("Admin already exists");
            process.exit(0);
        }

        const admin = new Admin({
            userName: "superadmin",
            email: "admin@thedigitechsolutions.com",
            password: "Letmegoin@0007"
        });

        await admin.save();
        console.log("Admin seeded successfully");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding admin:", error);
        process.exit(1);
    }
};

seedAdmin();

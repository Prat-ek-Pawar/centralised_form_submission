const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load .env from project root
dotenv.config({ path: path.join(__dirname, "../../.env") });

const Admin = require("../models/adminModel");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connected");

    // Check if admin already exists
    const existing = await Admin.findOne({
      email: "admin@thedigitechsolutions.com",
    });
    if (existing) {
      console.log("Admin already exists:");
      console.log(`  userName: ${existing.userName}`);
      console.log(`  email: ${existing.email}`);
      console.log("Skipping creation.");
      process.exit(0);
    }

    const admin = await Admin.create({
      userName: "admin",
      email: "admin@thedigitechsolutions.com",
      password: "Letmegoin@0007",
    });

    console.log("✅ Admin seeded successfully!");
    console.log(`  userName: ${admin.userName}`);
    console.log(`  email: ${admin.email}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();

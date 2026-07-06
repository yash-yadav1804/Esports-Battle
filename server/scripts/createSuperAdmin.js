const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const User = require("../models/User");
const { ROLES } = require("../constants/roles");

dotenv.config();

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI or MONGODB_URI is missing in .env");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
};

const validateInput = ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new Error(
      "SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are required",
    );
  }

  if (password.length < 8) {
    throw new Error("SUPER_ADMIN_PASSWORD must be at least 8 characters long");
  }

  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    throw new Error(
      "SUPER_ADMIN_PASSWORD must contain at least one letter and one number",
    );
  }
};

const createSuperAdmin = async () => {
  try {
    await connectDB();

    const superAdminData = {
      name: process.env.SUPER_ADMIN_NAME?.trim(),
      email: process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase(),
      password: process.env.SUPER_ADMIN_PASSWORD,
    };

    validateInput(superAdminData);

    const existingSuperAdmin = await User.findOne({
      role: ROLES.SUPER_ADMIN,
    });

    if (existingSuperAdmin) {
      console.log("SuperAdmin already exists. No new SuperAdmin created.");
      console.log(`Existing SuperAdmin email: ${existingSuperAdmin.email}`);
      process.exit(0);
    }

    const existingUser = await User.findOne({
      email: superAdminData.email,
    });

    const hashedPassword = await bcrypt.hash(superAdminData.password, 10);

    if (existingUser) {
      existingUser.name = superAdminData.name;
      existingUser.password = hashedPassword;
      existingUser.role = ROLES.SUPER_ADMIN;

      await existingUser.save();

      console.log("Existing user upgraded to SuperAdmin successfully.");
      console.log(`Email: ${existingUser.email}`);
      process.exit(0);
    }

    const superAdmin = await User.create({
      name: superAdminData.name,
      email: superAdminData.email,
      password: hashedPassword,
      role: ROLES.SUPER_ADMIN,
      ign: "superadmin",
      bgmiUID: "00000000",
    });

    console.log("SuperAdmin created successfully.");
    console.log(`Email: ${superAdmin.email}`);

    process.exit(0);
  } catch (error) {
    console.error("Failed to create SuperAdmin:");
    console.error(error.message);
    process.exit(1);
  }
};

createSuperAdmin();

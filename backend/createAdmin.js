const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const Admin = require("./models/Admin");
const { hashPassword } = require("./services/authService");

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@skillora.com").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "AdminPass123!";
const ADMIN_NAME = process.env.ADMIN_NAME || "Skillora Admin";

const permissions = [
  "manage_recruiters",
  "manage_candidates",
  "manage_jobs",
  "manage_complaints",
  "manage_opportunities",
  "view_analytics",
  "manage_admins",
];

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  await mongoose.connect(process.env.MONGO_URI);
};

const createSingleAdmin = async () => {
  const existingAdminUser = await User.findOne({ role: "admin" });

  if (existingAdminUser) {
    const existingProfile = await Admin.findOne({ userId: existingAdminUser._id });

    if (!existingProfile) {
      await Admin.create({
        userId: existingAdminUser._id,
        singletonKey: "primary",
        department: "Operations",
        permissions,
        adminLevel: "super_admin",
        isActive: true,
        notes: "Primary system administrator",
      });
      console.log(`Admin profile created for existing admin: ${existingAdminUser.email}`);
      return;
    }

    console.log(`Admin already exists: ${existingAdminUser.email}`);
    return;
  }

  const existingEmailUser = await User.findOne({ email: ADMIN_EMAIL });
  if (existingEmailUser) {
    throw new Error(`A non-admin account already exists with email ${ADMIN_EMAIL}`);
  }

  const adminUser = await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    passwordHash: await hashPassword(ADMIN_PASSWORD),
    role: "admin",
    status: "active",
    profileCompleted: true,
  });

  await Admin.create({
    userId: adminUser._id,
    singletonKey: "primary",
    department: "Operations",
    permissions,
    adminLevel: "super_admin",
    isActive: true,
    notes: "Primary system administrator",
  });

  console.log(`Admin created: ${ADMIN_EMAIL}`);
};

const main = async () => {
  try {
    await connectDB();
    await createSingleAdmin();
  } catch (error) {
    console.error("Failed to create admin:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

main();

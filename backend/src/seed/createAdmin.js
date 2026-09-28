import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import bcrypt from "bcryptjs";

import User from "../models/User.js";
import connectDB from "../config/db.js";
import env from "../config/env.js";

const createAdmin = async () => {
  try {
    await connectDB();

    const adminEmail =
      process.env.ADMIN_SEED_EMAIL || "admin@pizzadelivery.com";

    const adminPassword =
      process.env.ADMIN_SEED_PASSWORD || "Admin@12345";

    const adminName =
      process.env.ADMIN_SEED_NAME || "Pizza Admin";

    const normalizedEmail = adminEmail.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    // Hash the admin password every time the seed script runs.
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // If the account already exists, promote/update it as admin.
    if (existingUser) {
      existingUser.name = adminName;
      existingUser.email = normalizedEmail;
      existingUser.password = hashedPassword;
      existingUser.role = "admin";
      existingUser.isEmailVerified = true;
      existingUser.isActive = true;

      await existingUser.save();

      console.log("Admin account updated successfully.");
      console.log(`Admin Email: ${adminEmail}`);
      console.log(
        `Admin Password: ${adminPassword} (reset just now - use this to log in)`
      );

      process.exit(0);
    }

    // If the account does not exist, create a new admin account.
    await User.create({
      name: adminName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "admin",
      isEmailVerified: true,
      isActive: true,
    });

    console.log("Admin account created successfully.");
    console.log(`Admin Email: ${adminEmail}`);
    console.log(`Admin Password: ${adminPassword}`);

    process.exit(0);
  } catch (error) {
    console.error("Admin creation failed:", error.message);

    process.exit(1);
  }
};

createAdmin();

// seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');

// Set your desired credentials here
const ADMIN_USERNAME = process.env.ADMIN_USERNAME; 
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; 

const seedAdmin = async () => {
  try {
    await connectDB();

    // 1. Check if an admin already exists to prevent duplicates
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      console.log('An admin user already exists in the database. Aborting.');
      process.exit();
    }

    // 2. Hash the password using bcrypt with 10 "salt rounds" for high security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // 3. Create and save the new admin document
    const admin = new Admin({
      username: ADMIN_USERNAME,
      passwordHash: hashedPassword
    });

    await admin.save();
    console.log(`Success! Admin user '${ADMIN_USERNAME}' created securely.`);
    
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
  } finally {
    // Disconnect from the database when finished
    mongoose.connection.close();
    process.exit();
  }
};

seedAdmin();
// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // This connects to the URI you defined in your .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Forcefully exit the process if the database fails to connect
    process.exit(1);
  }
};

module.exports = connectDB;
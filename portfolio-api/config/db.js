// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('Missing MongoDB connection string. Set MONGO_URI or MONGODB_URI.');
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Forcefully exit the process if the database fails to connect
    process.exit(1);
  }
};

module.exports = connectDB;
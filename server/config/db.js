const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // 1. Attempt to connect using the URI from .env
        const conn = await mongoose.connect(process.env.MONGO_URI);
        // 2. Success message
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // 3. Error handling
        console.error(`Error: ${error.message}`);
        process.exit(1); // Stop the server if DB fails, because we can't do anything without it
    }
};

module.exports = connectDB;
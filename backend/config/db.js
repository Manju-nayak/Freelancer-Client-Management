
const mongoose = require("mongoose");
const dns = require("dns");

// Use alternative DNS resolvers for MongoDB SRV/TXT lookups
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected successfully!");
        console.log("Database:", mongoose.connection.name);

    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};

module.exports = connectDB;

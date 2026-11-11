
import mongoose from "mongoose";
import dns from "node:dns";

// Use public DNS servers for MongoDB SRV lookup
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in .env file");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully!");
    console.log("Database:", mongoose.connection.name);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

export default connectDB;

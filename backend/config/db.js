
import mongoose from "mongoose";
import dns from "node:dns";

// Use public DNS servers for MongoDB SRV lookup
dns.setServers(["8.8.8.8", "8.8.4.4"]);

let connectionPromise;

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from the environment");
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (connectionPromise) {
    await connectionPromise;
    return;
  }

  try {
    connectionPromise = mongoose.connect(process.env.MONGO_URI);
    await connectionPromise;

    console.log("MongoDB connected successfully!");
    console.log("Database:", mongoose.connection.name);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  } finally {
    connectionPromise = undefined;
  }
};

export default connectDB;

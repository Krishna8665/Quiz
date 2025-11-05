import mongoose from "mongoose";
import envConfig from "./config";

const connectToDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(envConfig.mongodbString as string);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1);
  }
};

export default connectToDatabase;

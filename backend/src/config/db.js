
import mongoose from "mongoose";
import env from "./env.js";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(env.MONGO_URI);

    console.log(
      `MongoDB Connected: ${connection.connection.host}`
    );
  } catch (error) {
    console.error("MongoDB Connection Failed:");
    console.error(error.message);

    process.exit(1);
  }
};

export default connectDB;
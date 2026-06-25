const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URL);
    console.log("Database Connected");
    return connection;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = connectDB;

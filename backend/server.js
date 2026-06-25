const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const connectDB = require("./config/db");
const seedAdmin = require("./config/seedAdmin");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const publicRoutes = require("./routes/publicRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/public", publicRoutes);

const startServer = async () => {
  try {
    await connectDB();
    await seedAdmin();

    app.listen(process.env.PORT, () => {
      console.log(`Server Running on Port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();

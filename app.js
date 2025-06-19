// app.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/admin");
const blogRoutes = require("./routes/blog");
const applicationRoutes = require("./routes/applicationRoutes");
const parentRoutes = require('./routes/parent');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // for parsing JSON
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/parents", parentRoutes);

// Sample route
app.get("/", (req, res) => {
  res.send("Preschool Enrollment API is running");
});

// Export app
module.exports = app;

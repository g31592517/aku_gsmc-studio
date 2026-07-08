require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const errorHandler = require("./middleware/errorHandler");
const projectBriefRoutes = require("./routes/projectBriefs");
const inspirationRoutes = require("./routes/inspiration");
const newsletterRoutes = require("./routes/newsletter");
const authRoutes = require("./routes/auth");

const app = express();

// Core middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());
app.use(morgan("dev"));

// Static file serving for uploaded attachments (admin/dashboard use)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "AKU Creative Services API is running." });
});

// Feature routes
app.use("/api/project-briefs", projectBriefRoutes);
app.use("/api/inspiration", inspirationRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/auth", authRoutes);


app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});


app.use(errorHandler);

const { verifyEmailConnection } = require("./services/emailService");
verifyEmailConnection();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

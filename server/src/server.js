require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const { verifyDatabaseConnection } = require("./config/database");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/auth");
const serviceRequestRoutes = require("./routes/serviceRequests");

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());
app.use(morgan("dev"));

// Serve uploaded files so the frontend can download attachments
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "AKU Creative Services API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/service-requests", serviceRequestRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

app.use(errorHandler);

const { verifyEmailConnection } = require("./services/emailService");

const PORT = process.env.PORT || 4000;

// Verify the database connection before accepting traffic
verifyDatabaseConnection().then(() => {
  verifyEmailConnection();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

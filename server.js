require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcrypt");

const { runBackup } = require("./utils/backup");

const CorsOrigin = require("./models/CorsOrigin");
const Admin = require("./models/Admin");

const app = express();
const PORT = process.env.PORT || 3000;

runBackup();

const seedAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();

    if (adminCount === 0) {
      console.log("Geen admin gevonden. Beheerder wordt aangemaakt...");

      const email = process.env.ADMIN_EMAIL;
      const password = process.env.ADMIN_PASSWORD;

      const hashedPassword = await bcrypt.hash(password, 10);

      const firstAdmin = new Admin({
        email: email,
        password: hashedPassword,
      });

      await firstAdmin.save();
      console.log(`Admin account aangemaakt voor: ${email}`);
    } else {
      console.log("Admin account is al aanwezig in de database.");
    }
  } catch (err) {
    console.error("Fout bij het aanmaken van admin seed:", err);
  }
};

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB!");
    seedAdmin();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(
  cors({
    origin: async function (origin, callback) {
      if (!origin) return callback(null, true);

      try {
        const allowed = await CorsOrigin.findOne({ origin: origin });

        if (allowed || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS policy."));
        }
      } catch (err) {
        callback(err);
      }
    },
  }),
);

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

const authRoutes = require("./routes/auth");
const clientRoutes = require("./routes/clients");
const corsRoutes = require("./routes/cors");
const mailRoutes = require("./routes/mail");

app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/cors", corsRoutes);
app.use("/api/send-mail", mailRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

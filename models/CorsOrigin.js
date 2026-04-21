const mongoose = require("mongoose");

const corsSchema = new mongoose.Schema({
  origin: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("CorsOrigin", corsSchema);

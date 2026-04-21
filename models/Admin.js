const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hier komt de hash in
});

module.exports = mongoose.model("Admin", adminSchema);

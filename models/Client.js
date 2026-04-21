const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  klantId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  companyName: { type: String, required: true },
});

module.exports = mongoose.model("Client", clientSchema);

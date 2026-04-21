const express = require("express");
const router = express.Router();
const Client = require("../models/Client");
const checkAuth = require("../middleware/auth");

router.use(checkAuth);

router.get("/", async (req, res) => {
  const clients = await Client.find();
  res.json(clients);
});

router.get("/:id", async (req, res) => {
  const client = await Client.findById(req.params.id);
  res.json(client);
});

router.post("/", async (req, res) => {
  try {
    const newClient = new Client(req.body);
    await newClient.save();
    res.json({ success: true, client: newClient });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, client: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  await Client.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;

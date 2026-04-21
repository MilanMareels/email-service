const express = require("express");
const router = express.Router();
const CorsOrigin = require("../models/CorsOrigin");
const checkAuth = require("../middleware/auth");

router.use(checkAuth);

router.get("/", async (req, res) => {
  const origins = await CorsOrigin.find();
  res.json(origins);
});

router.post("/", async (req, res) => {
  try {
    const newOrigin = new CorsOrigin(req.body);
    await newOrigin.save();
    res.json({ success: true, origin: newOrigin });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  await CorsOrigin.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;

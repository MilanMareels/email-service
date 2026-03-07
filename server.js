require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const klantenLijst = {
  carestonesolutions: "info@carestonesolutions.be",
};

app.post("/api/send-mail", async (req, res) => {
  const { naam, email, bericht, klantId } = req.body;
  const doelEmail = klantenLijst[klantId];

  if (!doelEmail) return res.status(403).json({ error: "Ongeldige klant ID." });
  if (!naam || !email || !bericht) return res.status(400).json({ error: "Vul alles in." });

  try {
    const mailOptions = {
      from: `"${naam} (via jouw website)" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: doelEmail,
      subject: `Nieuw bericht van: ${naam}`,
      text: `Je hebt een nieuw bericht via je website!\n\nNaam: ${naam}\nEmail: ${email}\n\nBericht:\n${bericht}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Done! Mail is verstuurd." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Fout bij verzenden." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Jouw centrale API server draait op poort ${PORT}`);
});

const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Client = require("../models/Client");
const rateLimit = require("express-rate-limit");

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: "Too many requests from this IP, please try again after 15 minutes." },
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/", emailLimiter, async (req, res) => {
  const { name, naam, lastName, email, phone, company, package, message, bericht, klantId } = req.body;

  const finalName = name || naam;
  const finalMessage = message || bericht;

  if (!finalName || !email || !finalMessage || !klantId) {
    return res.status(400).json({ error: "Please fill in all required fields." });
  }

  try {
    const foundClient = await Client.findOne({ klantId: klantId });

    if (!foundClient || !foundClient.email) {
      return res.status(403).json({ error: "Invalid customer ID. Customer not found." });
    }

    const targetEmail = foundClient.email;

    let detailsHtml = `
      <tr>
        <td style="padding: 12px; border: 1px solid #eee; background-color: #f8fafc; width: 30%; color: #475569; font-weight: bold;">Voornaam:</td>
        <td style="padding: 12px; border: 1px solid #eee; color: #1e293b;">${finalName}</td>
      </tr>
    `;

    if (lastName) {
      detailsHtml += `
        <tr>
          <td style="padding: 12px; border: 1px solid #eee; background-color: #f8fafc; color: #475569; font-weight: bold;">Achternaam:</td>
          <td style="padding: 12px; border: 1px solid #eee; color: #1e293b;">${lastName}</td>
        </tr>
      `;
    }

    detailsHtml += `
      <tr>
        <td style="padding: 12px; border: 1px solid #eee; background-color: #f8fafc; color: #475569; font-weight: bold;">E-mailadres:</td>
        <td style="padding: 12px; border: 1px solid #eee;">
          <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>
        </td>
      </tr>
    `;

    if (phone) {
      detailsHtml += `
        <tr>
          <td style="padding: 12px; border: 1px solid #eee; background-color: #f8fafc; color: #475569; font-weight: bold;">Telefoonnummer:</td>
          <td style="padding: 12px; border: 1px solid #eee; color: #1e293b;">${phone}</td>
        </tr>
      `;
    }

    if (company) {
      detailsHtml += `
        <tr>
          <td style="padding: 12px; border: 1px solid #eee; background-color: #f8fafc; color: #475569; font-weight: bold;">Bedrijf:</td>
          <td style="padding: 12px; border: 1px solid #eee; color: #1e293b;">${company}</td>
        </tr>
      `;
    }

    if (package) {
      detailsHtml += `
        <tr>
          <td style="padding: 12px; border: 1px solid #eee; background-color: #f8fafc; color: #475569; font-weight: bold;">Gewenst Pakket:</td>
          <td style="padding: 12px; border: 1px solid #eee; color: #1e293b;">${package}</td>
        </tr>
      `;
    }

    const mailOptions = {
      from: {
        name: `${foundClient.companyName}`,
        address: process.env.EMAIL_USER,
      },
      replyTo: email,
      to: targetEmail,
      subject: `Nieuw bericht van: ${finalName} ${lastName || ""}`.trim(),
      text: `Je hebt een nieuw bericht via je website!\n\nNaam: ${finalName} ${lastName || ""}\nEmail: ${email}\n\nBericht:\n${finalMessage}`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background-color: #2563eb; padding: 20px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 22px;">Nieuw bericht via de website</h2>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            ${detailsHtml}
          </table>

          <h3 style="color: #1e293b; font-size: 16px; border-bottom: 2px solid #2563eb; padding-bottom: 5px; display: inline-block; margin-top: 0;">Bericht:</h3>
          <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #2563eb; border-radius: 4px; color: #334155; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${finalMessage}</div>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 12px; color: #64748b;">Dit is een automatisch bericht vanaf het contactformulier op je website.</p>
        </div>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Database or Email error:", error);
    res.status(500).json({ success: false, error: "An error occurred while sending the email." });
  }
});

module.exports = router;

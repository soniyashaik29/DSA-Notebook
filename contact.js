const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const nodemailer = require("nodemailer");

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // 1️⃣ Save message FIRST (this will always store)
    const contact = await Contact.create({
      name,
      email,
      message
    });

    // 2️⃣ Email setup (IMPORTANT FIX HERE)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL,   // ❗ NEVER use user email here
      to: process.env.EMAIL,
      subject: "New Contact Form Message",
      html: `
        <h3>New Contact Message</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b> ${message}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    // 3️⃣ Update email status
    contact.emailSent = true;
    await contact.save();

    res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;

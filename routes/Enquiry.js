const express = require("express");
const router = express.Router();
const Enquiry = require("../models/Enquiry");
const nodemailer = require("nodemailer");

// ✅ SMTP (Gmail - lebih stabil)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Test koneksi SMTP saat start
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ SMTP ERROR:", error);
  } else {
    console.log("✅ SMTP READY");
  }
});

// 🚀 POST /api/submit
router.post("/submit", async (req, res) => {
  try {
    const data = req.body;

    console.log("📩 Incoming data:", data);

    // ✅ 1. Save ke MongoDB
    const saved = await Enquiry.create(data);

    // ✅ 2. Kirim response dulu (ANTI 502)
    res.status(200).json({
      success: true,
      message: "Enquiry submitted successfully",
      data: saved,
    });

    // ✅ 3. Kirim email di background (NON-BLOCKING)
    transporter.sendMail({
      from: `"Notes SG" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      replyTo: data.email,
      subject: "New Event Enquiry",
      html: `
        <h2>New Event Enquiry</h2>
        <hr/>

        <p><b>Name:</b> ${data.name}</p>
        <p><b>Company:</b> ${data.company || "-"}</p>
        <p><b>Email:</b> ${data.email}</p>
        <p><b>Contact:</b> ${data.contact || "-"}</p>

        <p><b>Event Type:</b> ${data.eventType || "-"}</p>
        <p><b>Date:</b> ${data.eventDate || "-"}</p>
        <p><b>Time:</b> ${data.eventTime || "-"}</p>
        <p><b>Duration:</b> ${data.duration || "-"}</p>

        <p><b>PAX:</b> ${data.pax || "-"}</p>
        <p><b>Seating:</b> ${data.seating || "-"}</p>
        <p><b>Package:</b> ${data.packageInterested || "-"}</p>

        <p><b>Budget:</b> ${data.budget || "-"}</p>
        <p><b>Requirements:</b> ${data.requirements || "-"}</p>
      `,
    })
    .then(() => console.log("✅ Email sent"))
    .catch(err => console.log("❌ Email error:", err));

  } catch (error) {
    console.error("❌ SERVER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
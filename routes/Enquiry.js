const express = require("express");
const router = express.Router();
const Enquiry = require("../models/Enquiry");
const nodemailer = require("nodemailer");


// ==============================
// 📧 SMTP HOSTINGER CONFIG
// ==============================
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // smtp.hostinger.com
  port: 465,
  secure: true, // SSL wajib true untuk 465

  auth: {
    user: process.env.EMAIL_USER, // hello@notessg.com
    pass: process.env.EMAIL_PASS, // password email HOSTINGER (tanpa spasi)
  },
});


// ==============================
// 🔍 TEST SMTP CONNECTION
// ==============================
transporter.verify((error) => {
  if (error) {
    console.log("❌ SMTP NOT READY:", error);
  } else {
    console.log("✅ SMTP READY (Hostinger)");
  }
});


// ==============================
// 🚀 SUBMIT ROUTE
// ==============================
router.post("/submit", async (req, res) => {
  try {
    const data = req.body;

    console.log("📩 Incoming data:", data);

    // ==========================
    // 💾 SAVE DATABASE
    // ==========================
    const saved = await Enquiry.create(data);

    // ==========================
    // ⚡ RESPOND FAST
    // ==========================
    res.status(200).json({
      success: true,
      message: "Enquiry submitted successfully",
      data: saved,
    });

    // ==========================
    // 📧 SEND EMAIL
    // ==========================
    const mailOptions = {
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
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log("❌ EMAIL FAILED:");
        console.log(err);
        return;
      }

      console.log("📨 EMAIL SENT SUCCESS:");
      console.log("Message ID:", info.messageId);
      console.log("Accepted:", info.accepted);
      console.log("Rejected:", info.rejected);
    });

  } catch (error) {
    console.error("❌ SERVER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const Enquiry = require("../models/Enquiry");
const nodemailer = require("nodemailer");

// 🔥 FORCE IPv4 (FIX ENETUNREACH IPv6)
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");


// ==============================
// 📧 SMTP CONFIG (GMAIL FIXED)
// ==============================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // STARTTLS (JANGAN 465)
  secure: false,
  family: 4, // FORCE IPv4
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // HARUS APP PASSWORD
  },
  tls: {
    rejectUnauthorized: false,
  },
});


// ==============================
// 🔍 TEST SMTP CONNECTION
// ==============================
transporter.verify((error) => {
  if (error) {
    console.log("❌ SMTP NOT READY:", error);
  } else {
    console.log("✅ SMTP READY");
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
    // 💾 SAVE TO DATABASE
    // ==========================
    const saved = await Enquiry.create(data);

    // ==========================
    // ⚡ RESPOND FAST (ANTI TIMEOUT)
    // ==========================
    res.status(200).json({
      success: true,
      message: "Enquiry submitted successfully",
      data: saved,
    });


    // ==========================
    // 📧 SEND EMAIL (ASYNC)
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
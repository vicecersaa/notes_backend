const express = require("express");
const router = express.Router();
const Enquiry = require("../models/Enquiry");
const { Resend } = require("resend");

// ==============================
// 📧 INIT RESEND
// ==============================
const resend = new Resend(process.env.RESEND_API_KEY);


// ==============================
// 🚀 POST /submit
// ==============================
router.post("/submit", async (req, res) => {
  try {
    const data = req.body;

    console.log("📩 Incoming data:", data);

    // ==========================
    // 💾 SAVE TO DB
    // ==========================
    const saved = await Enquiry.create(data);

    // ==========================
    // ⚡ RESPONSE FAST
    // ==========================
    res.status(200).json({
      success: true,
      message: "Enquiry submitted successfully",
      data: saved,
    });

    // ==========================
    // 📧 SEND EMAIL (NO SMTP)
    // ==========================
    const emailResult = await resend.emails.send({
      from: "Notes SG <onboarding@resend.dev>",
      to: process.env.EMAIL_TO,
      reply_to: data.email,
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
    });

    console.log("📨 EMAIL SENT SUCCESS:", emailResult);

  } catch (error) {
    console.error("❌ ERROR:", error);
  }
});

module.exports = router;
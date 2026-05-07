const express = require("express");
const router = express.Router();
const Enquiry = require("../models/Enquiry");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

router.post("/submit", async (req, res) => {
  try {
    const data = req.body;
    console.log("📩 Incoming data:", data);

    // 1) Save DB
    const saved = await Enquiry.create(data);

    // 2) Respond cepat
    res.status(200).json({
      success: true,
      message: "Enquiry submitted successfully",
      data: saved,
    });

    // 3) Kirim email (async)
    const result = await resend.emails.send({
      from: "Notes SG <noreply@notessg.com>",
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
        <p><b>Food & Drinks:</b> ${data.foodDrinkPreference || "-"}</p>
       

        <p><b>Budget:</b> ${data.budget || "-"}</p>
        <p><b>Requirements:</b> ${data.requirements || "-"}</p>
      `,
    });

    console.log("📨 EMAIL RESULT:", result);
  } catch (err) {
    console.error("❌ ERROR:", err);
  }
});

module.exports = router;
const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      type: String,
      default: "",
      trim: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    eventDate: {
      type: String,
    },
    eventTime: {
      type: String,
    },
    duration: {
      type: String,
    },
    pax: {
      type: Number,
    },
    seating: {
      type: String, // sudah include "Others: ..." kalau user pilih Others
    },
    foodDrinkPreference: {
      type: String,
      enum: ["Buffet Package", "Ala Carte", ""],
      default: "",
    },
    packageInterested: {
      type: String,
      enum: ["yes", "no"],
    },
    budget: {
      type: String,
    },
    requirements: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Enquiry", enquirySchema);
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    childId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Children",
      required: false,
    },
    studentName: {
      type: String,
      required: true,
    },
    birthdate: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    grade: {
      type: String, // nursery: lớp mầm, pre-k: lớp chồi, kindergarten: lớp lá
      default: "nursery",
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    birthCertificateImage: {
      type: String,
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: { type: String },
    status: {
      type: String,
      enum: [
        "payment_pending", // Đã submit, chờ thanh toán
        "payment_completed", // Đã thanh toán, chờ admin duyệt
        "approved",        // Admin đã duyệt
        "rejected",        // Admin từ chối
        "cancelled"        // Đơn bị hủy
      ],
      default: "payment_pending",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);

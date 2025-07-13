const express = require("express");
const { getPaymentUrl, getPaymentByUserId } = require("../controllers/paymentController");
const { refundPayment } = require("../controllers/paymentController");
const { vnpayReturn } = require("../controllers/paymentController");
const { getTotalPayment, getMonthlyTotalPayment } = require("../controllers/paymentController");

const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// router.get("/", protect, requireRole(["staff"]), getAllBlogs);
// router.get("/:id", protect, requireRole(["staff"]), getBlogById);
// router.post("/blog", protect, requireRole(["staff"]), createBlog);

router.post("/getPaymentUrl", getPaymentUrl);
router.get("/getPaymentByUserId/:userId", getPaymentByUserId);
router.post("/refund", refundPayment);
router.get("/vnpay/return/:applicationId", vnpayReturn);
router.get("/total", protect, requireRole(["admin"]), getTotalPayment);
router.get("/monthly-total", protect, requireRole(["admin"]), getMonthlyTotalPayment);

module.exports = router;

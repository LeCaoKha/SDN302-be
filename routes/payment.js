const express = require("express");
const { 
  getPaymentUrl, 
  getPaymentByUserId, 
  refundPayment, 
  vnpayReturn, 
  getTotalPayment, 
  getMonthlyTotalPayment,
  getTotalRefund,
  getRefunds,
  getAllPayment,
  getPaymentById
} = require("../controllers/paymentController");

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
router.get("/total-refund", protect, requireRole(["admin"]), getTotalRefund);
router.get("/refunds", protect, requireRole(["admin"]), getRefunds);
router.get("/all", protect, requireRole(["admin"]), getAllPayment);
router.get("/:paymentId", protect, requireRole(["admin"]), getPaymentById);

module.exports = router;

const express = require("express");
const { getPaymentUrl } = require("../controllers/paymentController");
const { refundPayment } = require("../controllers/paymentController");
const { vnpayReturn } = require("../controllers/paymentController");

const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// router.get("/", protect, requireRole(["staff"]), getAllBlogs);
// router.get("/:id", protect, requireRole(["staff"]), getBlogById);
// router.post("/blog", protect, requireRole(["staff"]), createBlog);

router.post("/getPaymentUrl", getPaymentUrl);
router.post("/refund", refundPayment);
router.get("/vnpay/return/:applicationId", vnpayReturn);

module.exports = router;

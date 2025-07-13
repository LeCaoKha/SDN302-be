const {
  VNPay,
  ignoreLogger,
  ProductCode,
  VnpLocale,
  dateFormat,
} = require("vnpay");
const axios = require("axios");
const crypto = require("crypto");
const Payment = require("../models/Payment");
const Application = require("../models/Application");
const url = require("url");
const querystring = require("querystring");
const tmnCode = "MTZVDR2T";
const secureSecret = "C70JGHY1X7BQ2B98HO2S7X9BNLQ4JGDX";

exports.getPaymentUrl = async (req, res) => {
  try {
    const { applicationId, userId } = req.body;
    const vnpay = new VNPay({
      tmnCode,
      secureSecret,
      vnpayHost: "https://sandbox.vnpayment.vn",
      testMode: true,
      hashAlgorithm: "SHA512",
      loggerFn: ignoreLogger,
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const txnRef = Date.now().toString(); // Tạo mã giao dịch duy nhất

    const vnpayResponse = await vnpay.buildPaymentUrl({
      vnp_Amount: 100000, // 1000 VNĐ = 100000
      vnp_IpAddr: req.ip || "127.0.0.1",
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `applicationId=${applicationId}&userId=${userId}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: `http://localhost:5000/api/payment/vnpay/return/${applicationId}`,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });

    // Gợi ý: lưu txnRef vào DB để phục vụ cho refund sau này
    res.status(201).json(vnpayResponse);
  } catch (error) {
    console.error("Error in getPaymentUrl:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const { applicationId, reason } = req.body;

    // Tìm payment theo applicationId
    const payment = await Payment.findOne({ applicationId });
    if (!payment) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch thanh toán cho applicationId này" });
    }

    const vnp_TxnRef = payment.vnp_TxnRef;
    const vnp_TransactionNo = payment.vnp_TransactionNo;
    const vnp_Amount = payment.vnp_Amount; // Đã là số, đơn vị VNĐ
    const vnp_TransactionDate = payment.vnp_PayDate; // Định dạng: yyyyMMddHHmmss

    const requestId = Date.now().toString();
    const createDate = new Date()
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14); // yyyyMMddHHmmss

    const ipAddr = req.ip || "127.0.0.1";
    const createBy = "admin"; // Người thực hiện hoàn tiền

    // Tạo dữ liệu JSON gửi
    const data = {
      vnp_RequestId: requestId,
      vnp_Version: "2.1.0",
      vnp_Command: "refund",
      vnp_TmnCode: tmnCode,
      vnp_TransactionType: "02", // Hoàn toàn
      vnp_TxnRef,
      vnp_Amount: vnp_Amount * 100, // VNPay yêu cầu x100
      vnp_TransactionNo,
      vnp_TransactionDate, // ngày giao dịch ban đầu (khi thanh toán)
      vnp_CreateBy: createBy,
      vnp_CreateDate: createDate,
      vnp_IpAddr: ipAddr,
      vnp_OrderInfo: reason || "Hoàn tiền giao dịch",
    };

    // Tạo chuỗi để ký hash
    const hashData =
      data.vnp_RequestId +
      "|" +
      data.vnp_Version +
      "|" +
      data.vnp_Command +
      "|" +
      data.vnp_TmnCode +
      "|" +
      data.vnp_TransactionType +
      "|" +
      data.vnp_TxnRef +
      "|" +
      data.vnp_Amount +
      "|" +
      data.vnp_TransactionNo +
      "|" +
      data.vnp_TransactionDate +
      "|" +
      data.vnp_CreateBy +
      "|" +
      data.vnp_CreateDate +
      "|" +
      data.vnp_IpAddr +
      "|" +
      data.vnp_OrderInfo;

    const secureHash = crypto
      .createHmac("sha512", secureSecret)
      .update(hashData)
      .digest("hex");

    data.vnp_SecureHash = secureHash;

    // Gửi dữ liệu hoàn tiền
    const response = await axios.post(
      "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Nếu refund thành công, xóa payment khỏi DB
    if (response.data && response.data.vnp_ResponseCode === '00') {
      await Payment.deleteOne({ applicationId });
    }

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Lỗi khi hoàn tiền:", error.message);
    res.status(500).json({ message: "Refund failed", error: error.message });
  }
};

exports.vnpayReturn = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    // Lấy raw query string (KHÔNG decode)
    const parsedUrl = url.parse(req.originalUrl);
    const rawQuery = parsedUrl.query;

    // Parse thành object nhưng KHÔNG decode
    const queryParams = rawQuery.split("&").reduce((acc, param) => {
      const [key, value] = param.split("=");
      acc[key] = value;
      return acc;
    }, {});

    const decodedOrderInfo = decodeURIComponent(queryParams.vnp_OrderInfo);
    const parsedInfo = Object.fromEntries(
      new URLSearchParams(decodedOrderInfo)
    );
    const userId = parsedInfo.userId;

    const secureHash = queryParams["vnp_SecureHash"];
    delete queryParams["vnp_SecureHash"];
    delete queryParams["vnp_SecureHashType"];

    const sortedKeys = Object.keys(queryParams).sort();
    const signData = sortedKeys
      .map((key) => `${key}=${queryParams[key]}`)
      .join("&");

    const computedHash = crypto
      .createHmac("sha512", secureSecret)
      .update(signData)
      .digest("hex");

    if (computedHash === secureHash && queryParams.vnp_ResponseCode === "00") {
      const newPayment = new Payment({
        madeBy: userId,
        payFor: "application",
        applicationId: applicationId,
        vnp_TxnRef: queryParams.vnp_TxnRef,
        vnp_Amount: Number(queryParams.vnp_Amount) / 100,
        vnp_OrderInfo: decodeURIComponent(queryParams.vnp_OrderInfo),
        vnp_TransactionNo: queryParams.vnp_TransactionNo,
        vnp_BankCode: queryParams.vnp_BankCode,
        vnp_CardType: queryParams.vnp_CardType,
        vnp_PayDate: queryParams.vnp_PayDate,
        vnp_ResponseCode: queryParams.vnp_ResponseCode,
        vnp_TransactionStatus: queryParams.vnp_TransactionStatus,
        vnp_SecureHash: secureHash,
      });
      await newPayment.save();

      const updatedApp = await Application.findByIdAndUpdate(
        applicationId,
        { status: "payment_completed" },
        { new: true }
      );

      if (!updatedApp) {
        console.warn("⚠️ Không tìm thấy đơn để cập nhật");
      } else {
        console.log("✅ Đã cập nhật đơn thành payment_completed");
      }

      return res.redirect(
        `http://localhost:5173/vnpay/return?applicationId=${applicationId}`
      );
    }

    return res.redirect(
      `http://localhost:5173/payment-failed?applicationId=${applicationId}`
    );
  } catch (error) {
    console.error("❌ Lỗi xử lý return từ VNPay:", error);
    return res.status(500).json({ message: "Lỗi xử lý kết quả thanh toán" });
  }
};

// Lấy tổng số tiền đã thanh toán
exports.getTotalPayment = async (req, res) => {
  try {
    const result = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$vnp_Amount" } } },
    ]);
    const total = result[0]?.total || 0;
    res.status(200).json({ total });
  } catch (error) {
    res.status(500).json({ message: "Error calculating total payment" });
  }
};

// Lấy tổng số tiền qua từng tháng
exports.getMonthlyTotalPayment = async (req, res) => {
  try {
    const result = await Payment.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: "$vnp_Amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error calculating monthly total payment" });
  }
};

exports.getPaymentByUserId = async (req, res) => {
  try {
    const {userId} = req.params;
    const payments = await Payment.find({madeBy: userId});
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error get user payment" });
  }
};

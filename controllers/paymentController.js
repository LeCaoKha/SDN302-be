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
const url = require("url");
const querystring = require("querystring");
const tmnCode = "MTZVDR2T";
const secureSecret = "C70JGHY1X7BQ2B98HO2S7X9BNLQ4JGDX";

exports.getPaymentUrl = async (req, res) => {
  try {
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
      vnp_OrderInfo: "Thanh toán học phí",
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: "http://localhost:5000/api/payment/vnpay/return",
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
    const {
      vnp_TxnRef,
      vnp_TransactionNo,
      vnp_Amount,
      vnp_TransactionDate,
      reason,
    } = req.body;

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

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Lỗi khi hoàn tiền:", error.message);
    res.status(500).json({ message: "Refund failed", error: error.message });
  }
};

exports.vnpayReturn = async (req, res) => {
  try {
    // Lấy raw query string (KHÔNG decode)
    const parsedUrl = url.parse(req.originalUrl);
    const rawQuery = parsedUrl.query;

    // Parse thành object nhưng KHÔNG decode
    const queryParams = rawQuery.split("&").reduce((acc, param) => {
      const [key, value] = param.split("=");
      acc[key] = value;
      return acc;
    }, {});

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
      console.log("✅ Giao dịch hợp lệ. Đã lưu vào MongoDB.");
      return res.redirect("http://localhost:5173/vnpay/return");
    }

    console.warn("❌ Giao dịch không hợp lệ hoặc hash không khớp.");
    console.log("🔐 Query:", queryParams);
    console.log("🔐 Hash từ VNPay:", secureHash);
    console.log("🔐 Hash tính lại:", computedHash);
    console.log("🔐 signData:", signData);

    return res.redirect("http://localhost:5173/payment-failed");
  } catch (error) {
    console.error("❌ Lỗi xử lý return từ VNPay:", error);
    return res.status(500).json({ message: "Lỗi xử lý kết quả thanh toán" });
  }
};

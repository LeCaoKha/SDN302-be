const express = require("express");
const {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  createTag,
  getAllTags,
} = require("../controllers/blogController");

const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAllBlogs);
router.get("/tag", getAllTags);
router.get("/:id", getBlogById);

// Các API dưới đây chỉ cho admin và staff
router.post("/", protect, requireRole(["admin", "staff"]), createBlog);
router.post("/tag", protect, requireRole(["admin", "staff"]), createTag);
router.put("/:id", protect, requireRole(["admin", "staff"]), updateBlog);
router.delete("/:id", protect, requireRole(["admin", "staff"]), deleteBlog);

module.exports = router;

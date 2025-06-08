const express = require("express");
const {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");

const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// router.get("/", protect, requireRole(["staff"]), getAllBlogs);
// router.get("/:id", protect, requireRole(["staff"]), getBlogById);
// router.post("/blog", protect, requireRole(["staff"]), createBlog);

router.get("/", getAllBlogs);
router.get("/:id", getBlogById);
router.post("/", createBlog);
router.put("/:id", updateBlog);
router.delete("/:id", deleteBlog);

module.exports = router;

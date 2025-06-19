const Blog = require("../models/Blog");
const Tag = require("../models/Tag");

exports.getAllBlogs = async (req, res) => {
  try {
    // Sắp xếp theo thời gian tạo từ màng xuống
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blogs", error });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blogId = req.params.id;
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blog", error });
  }
};

exports.createBlog = async (req, res) => {
  try {
    const { title, image, content, author, tags } = req.body;

    if (!title || !image || !content || !author) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Nếu tags là một mảng, sử dụng luôn, nếu chỉ là một dòng văn bản, đưa vào mảng
    const tagsArray = Array.isArray(tags) ? tags : [tags];
    const newBlog = new Blog({
      title,
      image,
      content,
      author,
      tags: tagsArray,
    });

    await newBlog.save();

    res.status(201).json(newBlog);
  } catch (error) {
    res.status(500).json({ message: "Error creating blog", error });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const { title, image, content, author, tags } = req.body;

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { title, image, content, author, tags },
      { new: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: "Error updating blog", error });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const deletedBlog = await Blog.findByIdAndDelete(blogId);
    if (!deletedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting blog", error });
  }
};

exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find();
    res.status(200).json(tags);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tags", error });
  }
};

exports.createTag = async (req, res) => {
  try {
    const { name } = req.body;

    // Kiểm tra nếu tag đã tồn tại
    const existingTag = await Tag.findOne({ name });
    if (existingTag) {
      return res.status(400).json({ message: "This tag already exists" });
    }

    const newTag = new Tag({ name });
    await newTag.save();

    res.status(201).json(newTag);
  } catch (error) {
    res.status(500).json({ message: "Error creating tag.", error });
  }
};

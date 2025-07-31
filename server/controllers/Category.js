const Category = require("../models/Category");

// Create Category Controller
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const categoryDetails = await Category.create({
      name,
      description,
    });
    console.log("New category created:", categoryDetails);

    return res.status(200).json({
      success: true,
      message: "Category Created Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to Create Category",
      error: error.message,
    });
  }
};

// Get All Categories Controller
exports.showAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.find({});
    return res.status(200).json({
      success: true,
      data: allCategories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to Show All Categorys",
      error: error.message,
    });
  }
};

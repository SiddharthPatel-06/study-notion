const Section = require("../models/Section");
const Course = require("../models/Course");

// Create NewSection Controller for Course
exports.createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body;

    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing required Properties",
      });
    }

    // Create a new section with the given name
    const newSection = await Section.create({ sectionName });

    // Add the New Section in the Course Content Array
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    res.status(200).json({
      success: true,
      message: "Section created successfully",
      updatedCourse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create section",
      error: error.message,
    });
  }
};

// Update Section Controller for Course
exports.updateSection = async (req, res) => {
  try {
    const { sectionName, sectionId } = req.body;

    if (!sectionId || !sectionName) {
      return res.status(400).json({
        success: false,
        message: "Missing required Properties",
      });
    }

    // Update Section
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
      data: section,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to Update Section",
      error: error.message,
    });
  }
};

// Delete Section Controller for Course
exports.deleteSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const deletedSection = await Section.findByIdAndDelete(sectionId);

    if (!deletedSection) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Section Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete section",
      error: error.message,
    });
  }
};

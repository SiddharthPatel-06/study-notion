const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { mongo, default: mongoose } = require("mongoose");

// Create a rating and review for a course
exports.createRating = async (req, res) => {
  try {
    // Get logged-in user ID
    const userId = req.user.id;

    // Extract rating, review, and course ID from request body
    const { courseId, rating, review } = req.body;

    // Check if the student is enrolled in the course
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });

    if (!courseDetails) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    // Check if the student has already reviewed the course
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });
    if (alreadyReviewed) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this course",
      });
    }

    // Create a new rating and review
    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: userId,
    });

    // Add the review reference to the course document
    await Course.findByIdAndUpdate(
      courseId,
      { $push: { ratingAndReviews: ratingReview._id } },
      { new: true }
    );

    // Send success response
    return res.status(201).json({
      success: true,
      message: "Rating and review added successfully",
      data: ratingReview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//  Get average rating for a course
exports.getAverageRating = async (req, res) => {
  try {
    // Get course ID
    const { courseId } = req.body;

    // Calculate average rating using aggregation
    const result = await RatingAndReview.aggregate([
      {
        $match: { course: new mongoose.Types.ObjectId(courseId) },
      },
      {
        $group: { _id: null, averageRating: { $avg: "$rating" } },
      },
    ]);

    // If ratings exist, return average
    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        averageRating: result[0].averageRating,
      });
    }

    // If no ratings exist
    return res.status(200).json({
      success: true,
      message: "No ratings yet for this course",
      averageRating: 0,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get all ratings and reviews (sorted by rating)
exports.getAllRating = async (req, res) => {
  try {
    // Fetch all reviews, sort by highest rating, and populate user/course details
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
      .exec();

    // Return reviews
    return res.status(200).json({
      success: true,
      message: "All reviews fetched successfully",
      data: allReviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");
const crypto = require("crypto");

// Capture Payment Controller
exports.capturePayment = async (req, res) => {
  const { course_id } = req.body;
  const userId = req.user.id;

  // Validate course_id
  if (!course_id) {
    console.log("Course ID not provided");
    return res.status(400).json({
      success: false,
      message: "Please provide valid course ID",
    });
  }

  let course;
  try {
    // Check if course exists
    course = await Course.findById(course_id);
    if (!course) {
      console.log("Course not found");
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user already enrolled
    const uid = new mongoose.Types.ObjectId(userId);
    if (course.studentsEnrolled.includes(uid)) {
      console.log("User already enrolled in the course");
      return res.status(409).json({
        success: false,
        message: "Student is already enrolled",
      });
    }
  } catch (error) {
    console.error("Error while checking course/user:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while verifying course",
    });
  }

  // Create Razorpay order
  const amount = course.price;
  const currency = "INR";
  const options = {
    amount: amount * 100,
    currency,
    receipt: Math.random(Date.now()).toString(),
    notes: {
      courseId: course_id,
      userId,
    },
  };

  try {
    //initiate the payment using razorpay
    const paymentResponse = await instance.orders.create(options);
    console.log("Razorpay order created:", paymentResponse);

    return res.status(200).json({
      success: true,
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      thumbnail: course.thumbnail,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    return res.status(500).json({
      success: false,
      message: "Could not initiate payment order",
    });
  }
};

// Verify Signature Controller of Razorpay and Server
exports.verifySignature = async (req, res) => {
  const webhookSecret = "12345678";

  const signature = req.headers["x-razorpay-signature"];

  const shasum = crypto.createHmac("sha256", webhookSecret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  // Compare Razorpay signature with our digest
  if (signature !== digest) {
    console.log("Signature mismatch: Unauthorized access");
    return res.status(400).json({
      success: false,
      message: "Invalid request signature",
    });
  }

  if (signature === digest) {
    console.log("Payment authorized by Razorpay");

    const { courseId, userId } = req.body.payload.payment.entity.notes;

    try {
      //fulfil the action

      //find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        return res.status(500).json({
          success: false,
          message: "Course not Found",
        });
      }

      console.log(enrolledCourse);

      //find the student and add the course to their list enrolled courses me
      const enrolledStudent = await User.findOneAndUpdate(
        { _id: userId },
        { $push: { courses: courseId } },
        { new: true }
      );

      console.log(enrolledStudent);

      // Send confirmation email
      const emailResponse = await mailSender(
        enrolledStudent.email,
        "Congratulations from StudyNotion",
        "Congratulations, you are onboarded into new StudyNotion Course"
      );

      console.log("Enrollment email sent:", emailResponse);

      return res.status(200).json({
        success: true,
        message: "Signature Verified and Course Added successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid request",
    });
  }
};

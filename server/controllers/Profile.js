const Profile = require("../models/Profile");
const User = require("../models/User");

// Controller to update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { dateOfBirth = "", about = "", contactNumber = "" } = req.body;

    // Get logged-in user's ID (added by auth middleware)
    const userId = req.user.id;

    // Fetch user details by ID
    const userDetails = await User.findById(userId);
    if (!userDetails) {
      console.log("User not found for profile update");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get profile using user's additionalDetails field
    const profile = await profile.findById(userDetails.additionalDetails);
    if (!profile) {
      console.log("Profile not found");
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Update profile fields
    profile.dateOfBirth = dateOfBirth;
    profile.about = about;
    profile.contactNumber = contactNumber;

    // Save updated profile to DB
    await profile.save();

    console.log("Profile updated successfully");
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the profile",
      error: error.message,
    });
  }
};

// Controller to delete a user account along with their profile
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Delete request for user ID:", userId);

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // First delete associated profile
    await Profile.findByIdAndDelete(user.additionalDetails);
    console.log("Associated profile deleted");

    // Then delete the user account
    await User.findByIdAndDelete(userId);
    console.log("User account deleted successfully");

    return res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User account could not be deleted",
      error: error.message,
    });
  }
};

// Controller to get full user details (including profile info)
exports.getAllUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user details and populate profile info from 'additionalDetails'
    const userDetails = await User.findById(userId)
      .populate("additionalDetails") // joins user with profile (like gender, DOB, etc.)
      .exec();

    // If user not found
    if (!userDetails) {
      console.log("User not found while fetching details");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("User data fetched successfully");
    return res.status(200).json({
      success: true,
      message: "User data fetched successfully",
      data: userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user details",
      error: error.message,
    });
  }
};

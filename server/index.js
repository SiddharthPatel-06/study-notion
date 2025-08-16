const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();
const PORT = process.env.PORT || 4000;

// Connect to the database
database.connectDB();

// middlewares
app.use(express.json()); // Parse incoming JSON requests
app.use(cookieParser()); // Parse cookies from the request

// Enable CORS for frontend (http://localhost:5173) with credentials
app.use(
  cors({
    origin: [/^http:\/\/localhost:\d+$/], // This means: localhost + any number after ":"
    credentials: true,
  })
);

// Handle file uploads and store them temporarily before processing
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

// Connect to Cloudinary for media uploads
cloudinaryConnect();

//routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);

const genaiRoutes = require("./services/genaiRoutes");
app.use("/api/v1/genai", genaiRoutes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "Welcome to the StudyNotion API!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

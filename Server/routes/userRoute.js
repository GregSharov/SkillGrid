import express from "express";
import Student from "../models/studentSchema.js";
import Teacher from "../models/teacherSchema.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configure multer to store files in /images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/students");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // .png
    const baseName = path.basename(file.originalname, ext); // logo
    cb(null, `${baseName}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

var Model = Student;
var subfolder = "students";

// Add a new user
router.post("/add", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      email,
      phone,
      password,
      isTeacher,
    } = req.body;

    if (isTeacher) {
      Model = Teacher;
      subfolder = "teachers";
    } else {
      Model = Student;
      subfolder = "students";
    }

    const existingUser = await Model.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const newUser = new Model({
      firstName,
      lastName,
      dateOfBirth,
      email,
      phone,
      password,
    });
    const savedUser = await newUser.save();
    res.status(201).json({ message: `User ${savedUser.email} registered.` });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ message: "Error saving user." });
  }
});

// Upload profile image
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const { userId } = req.body;
    const imagePath = `http://localhost:3000/images/${subfolder}/${req.file.filename}`;

    // Detect correct model (Student or Teacher)
    Model = (await Student.findById(userId)) ? Student : Teacher;

    const user = await Model.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.image = imagePath;
    await user.save();

    res.status(200).json({
      message: "Profile image uploaded successfully.",
      imageUrl: imagePath,
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    res.status(500).json({ message: "Error uploading profile image." });
  }
});

// Sign in user
router.post("/signin", async (req, res) => {
  try {
    const { email, password, isTeacher } = req.body;

    if (isTeacher) {
      Model = Teacher;
    } else {
      Model = Student;
    }

    // Check if the user exists
    const user = await Model.findOne({ email, password });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    res.json({
      message: "User signed in successfully.",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isTeacher,
      },
    });
  } catch (error) {
    console.error("Error signing in user:", error);
    res.status(500).json({ message: "Error signing in user." });
  }
});


export default router;

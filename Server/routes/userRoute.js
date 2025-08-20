import express from "express";
import Student from "../models/studentSchema.js";
import Teacher from "../models/teacherSchema.js";
import { Subject } from "../models/subjectSchema.js";
import { HashPassword, VerifyPassword } from "../middleware/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

var subfolder = "";

// Configure multer to store files in /images
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const { userId } = req.body;
    subfolder = (await Student.findById(userId)) ? "students" : "teachers";

    const dir = `./images/${subfolder}`;
    // Ensure the directory exists
    fs.access(dir, (err) => {
      if (err) {
        fs.mkdir(dir, { recursive: true }, (err) => {
          if (err) {
            return cb(err);
          }
          cb(null, dir);
        });
      } else {
        cb(null, dir);
      }
    });
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // .png
    const baseName = path.basename(file.originalname, ext); // logo
    cb(null, `${baseName}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage: storage });

var Model = Student;

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

// Sign Up user
router.post("/signup", async (req, res) => {
  const {
    firstName,
    lastName,
    dateOfBirth,
    email,
    phone,
    password,
    isTeacher,
  } = req.body;
  try {
    // Detect correct model (Student or Teacher)
    const Model = isTeacher ? Teacher : Student;

    // Check if user already exists
    const existingUser = await Model.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash the password
    const hashedPassword = await HashPassword(password);

    // Create new user
    const newUser = new Model({
      firstName,
      lastName,
      dateOfBirth,
      email,
      phone,
      password: hashedPassword,
      isTeacher,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Error signing up user:", error);
    res.status(500).json({ message: "Error signing up user." });
  }
});

// Login user
router.post("/login", async (req, res) => {
  const { email, password, isTeacher } = req.body;
  try {
    // Detect correct model (Student or Teacher)
    const Model = isTeacher ? Teacher : Student;

    // Check if email exists in such Model
    const user = await Model.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Verify password
    const isValid = await VerifyPassword(user.password, password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid password." });
    }

    // Set user session
    req.session.user = {
      id: user._id,
      role: user.isTeacher,
    };
    res.status(200).json({ message: "Login successful." });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Error logging in user." });
  }
});

// Put subjects and lessons to account
router.put("/:id/subjects", async (req, res) => {
  const { id } = req.params;
  const { subjects, lessons } = req.body; // from React

  try {
    // Find teacher or student
    let user = await Student.findById(id);
    if (!user) {
      user = await Teacher.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
    }

    // Fetch all selected subject documents from DB
    const allSubjects = await Subject.find({
      _id: { $in: subjects.map((s) => s.value) },
    });

    // Start with existing user subjects
    const updatedSubjects = [...user.subjects];

    allSubjects.forEach((subj) => {
      const selectedLessons = lessons[subj._id] || [];

      // Find full lesson docs for selected lessons
      const embeddedLessons = subj.lessons.filter((lesson) =>
        selectedLessons.some((sel) => sel.value === lesson._id.toString())
      );

      // Check if this subject already exists for user
      const existingIndex = updatedSubjects.findIndex(
        (s) => s._id.toString() === subj._id.toString()
      );

      if (existingIndex >= 0) {
        // Update lessons for existing subject
        updatedSubjects[existingIndex].lessons = embeddedLessons.map(
          (lesson) => ({
            _id: lesson._id,
            name: lesson.name,
            image: lesson.image,
            description: lesson.description,
          })
        );
      } else {
        // Add as a new subject
        updatedSubjects.push({
          _id: subj._id,
          name: subj.name,
          image: subj.image,
          description: subj.description,
          lessons: embeddedLessons.map((lesson) => ({
            _id: lesson._id,
            name: lesson.name,
            image: lesson.image,
            description: lesson.description,
          })),
        });
      }
    });

    // Remove any subjects that are no longer selected
    const selectedIds = subjects.map((s) => s.value.toString());
    const finalSubjects = updatedSubjects.filter((s) =>
      selectedIds.includes(s._id.toString())
    );

    // Save changes
    user.subjects = finalSubjects;
    await user.save();

    res.status(200).json({
      message: "Subjects and lessons updated successfully",
      subjects: user.subjects,
    });
  } catch (err) {
    console.error("Error updating subjects:", err);
    res.status(500).json({ message: "Server error updating subjects" });
  }
});

export default router;

import express from "express";
import Student from "../models/studentSchema.js";
import Teacher from "../models/teacherSchema.js";

const router = express.Router();

var Model = Student;

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

    // let Model = Student;
    if (isTeacher) {
      Model = Teacher;
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

// Sign in user
router.post("/signin", async (req, res) => {
  try {
    const { email, password, isTeacher } = req.body;

    // let Model = Student;
    if (isTeacher) {
      Model = Teacher;
    }

    // Check if the user exists
    const user = await Model.find({ email, password });

    if (user.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    res.json({ message: `User found: ${email} ${password}` });
  } catch (error) {
    console.error("Error signing in user:", error);
    res.status(500).json({ message: "Error signing in user." });
  }
});

export default router;

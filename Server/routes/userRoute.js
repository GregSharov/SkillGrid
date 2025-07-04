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

    if (isTeacher) {
      Model = Teacher;
    } else {
      Model = Student;
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

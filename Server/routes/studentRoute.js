import express from "express";
import Student from "../models/studentSchema.js";
import { HashPassword } from "../utils/auth.js";

const router = express.Router();

// GET all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch students.", error: error.message });
  }
});

// GET single student
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch student.", error: error.message });
  }
});

// POST create student
router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, dateOfBirth, password, image } = req.body;
    
    // Hash password
    const hashedPassword = await HashPassword(password);
    
    const student = new Student({
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      password: hashedPassword,
      image: image,
      isTeacher: false,
      subjects: []
    });
    
    const savedStudent = await student.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(500).json({ message: "Failed to create student.", error: error.message });
  }
});

// PUT update student
router.put("/:id", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, dateOfBirth, password, image, subjects } = req.body;
    
    const updateData = {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      image
    };
    
    // Only hash password if provided
    if (password) {
      updateData.password = await HashPassword(password);
    }
    
    // Update subjects if provided
    if (subjects) {
      updateData.subjects = subjects;
    }
    
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: "Failed to update student.", error: error.message });
  }
});

// DELETE student
router.delete("/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete student.", error: error.message });
  }
});

export default router;

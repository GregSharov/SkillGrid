import express from "express";
import Teacher from "../models/teacherSchema.js";
import { HashPassword } from "../utils/auth.js";

const router = express.Router();

// GET all teachers
router.get("/", async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch teachers.", error: error.message });
  }
});

// GET single teacher
router.get("/:id", async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res.status(200).json(teacher);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch teacher.", error: error.message });
  }
});

// POST create teacher
router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, dateOfBirth, password, image } = req.body;
    
    // Hash password
    const hashedPassword = await HashPassword(password);
    
    const teacher = new Teacher({
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      password: hashedPassword,
      image: image,
      isTeacher: true,
      subjects: []
    });
    
    const savedTeacher = await teacher.save();
    res.status(201).json(savedTeacher);
  } catch (error) {
    res.status(500).json({ message: "Failed to create teacher.", error: error.message });
  }
});

// PUT update teacher
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
    
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    
    res.status(200).json(teacher);
  } catch (error) {
    res.status(500).json({ message: "Failed to update teacher.", error: error.message });
  }
});

// DELETE teacher
router.delete("/:id", async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete teacher.", error: error.message });
  }
});

export default router;

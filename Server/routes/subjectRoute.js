import express from "express";
import { Subject } from "../models/subjectSchema.js";

const router = express.Router();

// Get subjects
router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subjects." });
  }
});

// Create a new subject
router.post("/add", async (req, res) => {
  try {
    const newSubject = new Subject(req.body);
    await newSubject.save();
    res.status(201).json({ message: "Subject added successfully!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a subject
router.put("/update", async (req, res) => {
  try {
    const updatedSubject = await Subject.findByIdAndUpdate(req.body._id, req.body, { new: true });
    res.status(200).json(updatedSubject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a subject
router.delete("/delete", async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.body._id);
    res.status(200).json({ message: "Subject deleted successfully!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

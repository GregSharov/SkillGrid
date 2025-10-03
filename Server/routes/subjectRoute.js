import express from "express";
import { Subject } from "../models/subjectSchema.js";

const router = express.Router();

// GET all subjects
router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subjects.", error: error.message });
  }
});

// GET single subject
router.get("/:id", async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subject.", error: error.message });
  }
});

// POST create subject
router.post("/", async (req, res) => {
  try {
    const { name, description, image, lessons } = req.body;
    
    const subject = new Subject({
      name,
      description,
      image: image,
      lessons: lessons || []
    });
    
    const savedSubject = await subject.save();
    res.status(201).json(savedSubject);
  } catch (error) {
    res.status(500).json({ message: "Failed to create subject.", error: error.message });
  }
});

// PUT update subject
router.put("/:id", async (req, res) => {
  try {
    const { name, description, image, lessons } = req.body;
    
    const updateData = {
      name,
      description,
      image
    };
    
    // Update lessons if provided
    if (lessons) {
      updateData.lessons = lessons;
    }
    
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    
    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ message: "Failed to update subject.", error: error.message });
  }
});

// DELETE subject
router.delete("/:id", async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete subject.", error: error.message });
  }
});

// POST add lesson to subject
router.post("/:id/lessons", async (req, res) => {
  try {
    const { name, description, image } = req.body;
    
    const lesson = {
      name,
      description,
      image: image
    };
    
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { $push: { lessons: lesson } },
      { new: true, runValidators: true }
    );
    
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    
    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ message: "Failed to add lesson.", error: error.message });
  }
});

// PUT update lesson in subject
router.put("/:id/lessons/:lessonId", async (req, res) => {
  try {
    const { name, description, image } = req.body;
    
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    
    const lessonIndex = subject.lessons.findIndex(lesson => lesson._id.toString() === req.params.lessonId);
    if (lessonIndex === -1) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    
    subject.lessons[lessonIndex] = {
      ...subject.lessons[lessonIndex],
      name,
      description,
      image
    };
    
    await subject.save();
    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ message: "Failed to update lesson.", error: error.message });
  }
});

// DELETE lesson from subject
router.delete("/:id/lessons/:lessonId", async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { $pull: { lessons: { _id: req.params.lessonId } } },
      { new: true }
    );
    
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    
    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ message: "Failed to delete lesson.", error: error.message });
  }
});

// Legacy routes for backward compatibility
router.post("/add", async (req, res) => {
  try {
    const newSubject = new Subject(req.body);
    await newSubject.save();
    res.status(201).json({ message: "Subject added successfully!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/update", async (req, res) => {
  try {
    const updatedSubject = await Subject.findByIdAndUpdate(req.body._id, req.body, { new: true });
    res.status(200).json(updatedSubject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/delete", async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.body._id);
    res.status(200).json({ message: "Subject deleted successfully!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

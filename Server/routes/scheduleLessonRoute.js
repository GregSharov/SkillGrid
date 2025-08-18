import express from "express";
import { Schedule } from "../models/scheduleSchema.js";

const router = express.Router();

// Post route to schedule a lesson
router.post("/add", async (req, res) => {
  const { teacherId, lessonId } = req.body;
  // Logic to schedule the lesson
  try {
    const newScheduledLesson = new Schedule({
      teacherId,
      lessonId,
    });

    const savedScheduledLesson = await newScheduledLesson.save();
    res.status(201).json({
      message: "Lesson scheduled successfully",
      data: savedScheduledLesson,
    });
  } catch (error) {
    res.status(500).json({ message: "Error scheduling lesson", error });
  }
});

export default router;

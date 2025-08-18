import express from "express";
import { Schedule } from "../models/scheduleSchema.js";

const router = express.Router();

// Post route to schedule a lesson
router.post("/add", async (req, res) => {
  const { teacher, slots } = req.body;
  // Logic to schedule the lesson
  try {
    const newScheduledLesson = new Schedule({
      teacher : {
        _id: teacher._id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
      },
      slots,
    });

    const savedScheduledLesson = await newScheduledLesson.save();
    if (!savedScheduledLesson) {
      return res.status(400).json({ message: "Failed to schedule lesson" });
    }

    res.status(201).json({
      message: "Lesson scheduled successfully",
      data: savedScheduledLesson,
    });
  } catch (error) {
    res.status(500).json({ message: "Error scheduling lesson", error });
  }
});

export default router;

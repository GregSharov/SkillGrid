import express from "express";
import { Schedule } from "../models/scheduleSchema.js";

const router = express.Router();

// Get scheduled lessons from db to User
router.get("/user/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const scheduledLessons = await Schedule.find({
      $or: [
        { "teacher._id": { $in: [userId] } },
        { "student._id": { $in: [userId] } },
      ],
    });

    if (!scheduledLessons || scheduledLessons.length === 0) {
      return res
        .status(200)
        .json({ data: [], message: "No scheduled lessons" });
    }

    res
      .status(200)
      .json({
        data: scheduledLessons,
        message: "Scheduled lessons fetched successfully",
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching scheduled lessons", error });
  }
});

// Post route to schedule a lesson
router.post("/add", async (req, res) => {
  const { teacher, student, slots } = req.body;

  // Logic to schedule the lesson
  try {
    const newScheduledLesson = new Schedule({
      teacher: {
        _id: teacher._id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
      },
      student: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
      },
      slots: slots.map((slot) => ({
        time: slot.time,
        date: slot.date,
        day: slot.day,
        lesson: {
          _id: slot.lesson._id,
          name: slot.lesson.name,
          description: slot.lesson.description,
        },
      })),
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

// Delete scheduled lesson
router.delete("/delete/:id", async (req, res) => {
  try {
    const slotId = req.params.id;

    const updatedLesson = await Schedule.findOneAndUpdate(
      { "slots._id": slotId },
      { $pull: { slots: { _id: slotId } } },
      { new: true }
    );

    if (!updatedLesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Clean up schedules with no slots left
    await Schedule.deleteMany({ slots: { $size: 0 } });

    return res.status(200).json({
      message: "Slot deleted successfully",
      slotId,
      scheduleId: updatedLesson._id,
      data: updatedLesson,
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting lesson", error });
  }
});

export default router;

import express from "express";
import { v4 as uuidv4 } from "uuid";
import { Schedule } from "../models/scheduleSchema.js";

const router = express.Router();

// Get all scheduled lessons (admin)
router.get("/all", async (req, res) => {
  try {
    const scheduledLessons = await Schedule.find();
    res.status(200).json({
      data: scheduledLessons,
      message: "All scheduled lessons fetched successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching scheduled lessons", error });
  }
});

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

// Get scheduled lesson by room id
router.get("/room/:id", async (req, res) => {
  const roomId = req.params.id;
  
  try {
    const scheduledLesson = await Schedule.findById({ _id: roomId });
    res.status(200).json({ data: scheduledLesson, message: "Scheduled lesson fetched successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching scheduled lesson", error });
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
      peers: [
        {
          teacherPeerId: uuidv4(),
          studentPeerId: uuidv4(),
        },
      ],
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
    console.log("Error scheduling lesson:", error);
    res.status(500).json({ message: "Please log in or sign up first" });
  }
});

// Update scheduled lesson peer id
router.put("/update/:id/peer", async (req, res) => {
  const { id } = req.params;
  const { teacherPeerId, studentPeerId } = req.body;

  try {
    const updatedSchedule = await Schedule.findByIdAndUpdate(id, { teacherPeerId, studentPeerId }, { new: true });
    res.status(200).json({ message: "Scheduled lesson peer id updated successfully", data: updatedSchedule });
  } catch (error) {
    res.status(500).json({ message: "Error updating scheduled lesson peer id", error });
  }
});

// Update scheduled lesson (admin)
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { teacher, student, slots } = req.body;

  try {
    const updatedSchedule = await Schedule.findByIdAndUpdate(id, { teacher, student, slots }, { new: true });
    res.status(200).json({ message: "Scheduled lesson updated successfully", data: updatedSchedule });
  } catch (error) {
    res.status(500).json({ message: "Error updating scheduled lesson", error });
  }
});

// Delete entire scheduled lesson
router.delete("/:id", async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const deletedSchedule = await Schedule.findByIdAndDelete(scheduleId);

    if (!deletedSchedule) {
      return res.status(404).json({ message: "Scheduled lesson not found" });
    }

    return res.status(200).json({
      message: "Scheduled lesson deleted successfully",
      scheduleId,
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting scheduled lesson", error });
  }
});

// Delete scheduled lesson slot
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

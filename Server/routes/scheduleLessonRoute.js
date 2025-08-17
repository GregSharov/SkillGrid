import express from "express";
const router = express.Router();

// Post route to schedule a lesson
router.post("/add", (req, res) => {
  const { teacherId, studentId, lessonId, slots } = req.body;
  // Logic to schedule the lesson
  try {
    // Here you would typically save the lesson to a database
    // For now, we will just return a success message
    res.status(200).json({
      message: "Lesson scheduled successfully",
      data: {
        teacherId,
        studentId,
        lessonId,
        slots
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error scheduling lesson", error });
  }
});

export default router;

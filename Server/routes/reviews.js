// routes/reviews.js
import express from "express";
import ReviewSchema from "../models/reviewSchema.js";
import { recomputeTeacherStats } from "../services/reviewStats.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Make sure your global auth middleware sets req.user; otherwise replace this with your real one
// function requireAuth(req, res, next) {
//   if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });
//   next();
// }

// CREATE/UPSERT review (no completed-lesson guard)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { teacherId, rating, comment = "" } = req.body;

    if (!teacherId || !rating) {
      return res
        .status(400)
        .json({ message: "teacherId and rating are required" });
    }

    const doc = await ReviewSchema.findOneAndUpdate(
      { teacherId, studentId },
      { $set: { rating, comment } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const stats = await recomputeTeacherStats(teacherId);
    res.json({ message: "Saved", review: doc, stats });
  } catch (e) {
    if (e.code === 11000) {
      return res
        .status(409)
        .json({ message: "You already reviewed this teacher." });
    }
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// LIST teacher reviews
router.get("/teacher/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;
    const items = await ReviewSchema.find({ teacherId })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("studentId", "firstName lastName")
      .lean();

    const avg =
      items.length > 0
        ? Math.round(
            (items.reduce((a, b) => a + b.rating, 0) / items.length) * 10
          ) / 10
        : 0;

    res.json({
      avg,
      count: items.length,
      items: items.map((r) => ({
        _id: r._id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        student: r.studentId
          ? { firstName: r.studentId.firstName, lastName: r.studentId.lastName }
          : null,
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// GET current student's review for this teacher
router.get("/me/teacher/:teacherId", authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { teacherId } = req.params;
    const r = await ReviewSchema.findOne({ teacherId, studentId }).lean();
    res.json(r || null);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE own review
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;
    const r = await ReviewSchema.findOne({ _id: req.params.id, studentId });
    if (!r) return res.status(404).json({ message: "Not found" });

    await ReviewSchema.deleteOne({ _id: r._id });
    await recomputeTeacherStats(r.teacherId);
    res.json({ message: "Deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

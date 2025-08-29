import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

// Ensure 1 review per (student, teacher)
reviewSchema.index({ teacherId: 1, studentId: 1 }, { unique: true });

const Review =
  mongoose.models.Review || mongoose.model("Review", reviewSchema, "Review");
export default Review;

import mongoose from "mongoose";
import ReviewSchema from "../models/reviewSchema.js";
import Teacher from "../models/teacherSchema.js";

export async function recomputeTeacherStats(teacherId) {
  const _id = new mongoose.Types.ObjectId(String(teacherId));
  const agg = await ReviewSchema.aggregate([
    { $match: { teacherId: _id } },
    {
      $group: {
        _id: "$teacherId",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);
  const { avg = 0, count = 0 } = agg[0] || {};
  const rounded = Math.round(avg * 10) / 10;
  await Teacher.updateOne(
    { _id },
    { $set: { ratingAverage: rounded, ratingCount: count } }
  );
  return { avg: rounded, count };
}

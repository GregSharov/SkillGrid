import mongoose from "mongoose";
const { Schema, model } = mongoose;

const scheduleSchema = new Schema({
  teacherId: { type: Schema.Types.ObjectId, ref: "Teacher" },
  lessonId: { type: Schema.Types.ObjectId, ref: "Lesson" },
});

const Schedule = model("Schedule", scheduleSchema, "Schedule");
export { scheduleSchema, Schedule };
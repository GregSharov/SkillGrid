import mongoose from "mongoose";
const { Schema, model } = mongoose;

const scheduleSchema = new Schema({
  teacher: { type: Object },
  slots: [{ type: Object }],
});

const Schedule = model("Schedule", scheduleSchema, "Schedule");
export { scheduleSchema, Schedule };
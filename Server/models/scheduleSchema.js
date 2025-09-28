import mongoose from "mongoose";
const { Schema, model } = mongoose;

// Define the peer schema
const peerSchema = new Schema({
  teacherPeerId: {
    type: String,
    required: true,
  },
  studentPeerId: {
    type: String,
    required: true,
  },
});

// Define the slot schema
const slotSchema = new Schema({
  time: { type: String, required: true },
  date: { type: String, required: true },
  day: { type: String, required: true },
  lesson: { type: Object },
});

// Define the schedule schema
const scheduleSchema = new Schema({
  teacher: { type: Object },
  student: { type: Object },
  slots: [slotSchema],
  peers: [peerSchema],
});

const Schedule = model("Schedule", scheduleSchema, "Schedule");
export { scheduleSchema, Schedule };

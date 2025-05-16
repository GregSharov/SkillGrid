import mongoose from "mongoose";
const { Schema, model } = mongoose;

// Define the lesson schema
const lessonSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

// Define the subject schema with embedded lessons
const subjectSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  lessons: [lessonSchema],
});

const Subject = model("Subject", subjectSchema);
export default Subject;

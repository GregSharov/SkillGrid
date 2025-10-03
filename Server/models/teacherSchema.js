import mongoose from "mongoose";
import { Subject } from "./subjectSchema.js";
const { Schema, model } = mongoose;

const teacherSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  subjects: [Subject.schema],
  image: {
    type: String,
    default: "https://res.cloudinary.com/de3jgizbm/image/upload/v1759523927/user_mtgtft.png",
    // required: true,
  },
  isTeacher: {
    type: Boolean,
    default: false,
  },
  ratingAverage: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
});

// Export both the schema and the model
const Teacher = model("Teacher", teacherSchema, "Teachers");
export default Teacher;

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
  subjects: [Subject.schema],
});

// Export both the schema and the model
const Teacher = model("Teacher", teacherSchema, "Teachers");
export default Teacher;

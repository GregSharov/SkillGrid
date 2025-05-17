import mongoose from "mongoose";
import { Subject } from "./subjectSchema.js";
const { Schema, model } = mongoose;

const studentSchema = new Schema({
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
});

// Export both the schema and the model
const Student = model("Student", studentSchema, "Students");
export default Student;

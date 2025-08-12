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
  image: {
    type: String,
    default: "http://localhost:3000/images/user.png"
    // required: true,
  },
  isTeacher: {
    type: Boolean,
    default: false,
  },
});

// Export both the schema and the model
const Student = model("Student", studentSchema, "Students");
export default Student;

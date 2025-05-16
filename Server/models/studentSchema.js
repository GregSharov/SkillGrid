import mongoose from "mongoose";
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
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  subjects: [
    {
      name: {
        type: String,
        required: false,
        unique: false,
      },
      themes: [
        {
          type: String,
          required: false,
        },
      ],
    },
  ],
});

// Export both the schema and the model
const Student = model("Student", studentSchema, "Students");
export default Student;

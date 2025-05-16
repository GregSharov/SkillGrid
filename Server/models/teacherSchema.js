import mongoose from "mongoose";
const { Schema } = mongoose;

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
    trim: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  subjects: [
    {
      name: {
        type: String,
        required: true,
        unique: true,
      },
      themes: [
        {
          type: String,
          required: true,
        },
      ],
    },
  ],
});

module.exports = teacherSchema;

import mongoose from "mongoose";
const { Schema } = mongoose;

const studentSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true,
        trim: true,
    },
    sex: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true,
        unique: true
    },
    themes: [
        {
            type: String,
            required: true
        }
    ]
});


module.exports = studentSchema;
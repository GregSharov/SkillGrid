import mongoose from "mongoose";
const { Schema } = mongoose;

const studentSchema = new Schema({
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
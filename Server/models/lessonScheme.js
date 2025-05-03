import mongoose from "mongoose";
const { Schema } = mongoose;

const lessonSchema = new Schema({
    subject: {
        type: String,
        required: true
    },
    themes: [
        {
            type: String,
            required: true
        }
    ]
});


module.exports = lessonSchema;
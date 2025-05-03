import mongoose from "mongoose";
const { Schema } = mongoose;

const lessonSchema = new Schema({
    subject: {
        type: String,
        themes: [{ type: String, required: true }], required: true
    }
});


module.exports = lessonSchema;
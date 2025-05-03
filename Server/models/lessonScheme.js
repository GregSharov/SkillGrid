import mongoose from "mongoose";
const { Schema } = mongoose;

const lessonSchema = new Schema({
    subject: { type: String },
    title: { type: String, required: true },
    author: { type: String, required: true },
    comments: [{ body: String, date: Date }],
    date: { type: Date, default: Date.now },
    rating: Number
});


module.exports = lessonSchema;
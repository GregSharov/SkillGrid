import mongoose from "mongoose";
const { Schema } = mongoose;

const commentSchema = new Schema({
    title: { type: String, required: true },
    author: String,
    comments: [{ body: String, date: Date }],
    date: { type: Date, default: Date.now },
    rating: Number
});


module.exports = commentSchema;
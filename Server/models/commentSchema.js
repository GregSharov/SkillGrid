import mongoose from "mongoose";
const { Schema } = mongoose;

const commentSchema = new Schema({
  teacher: { type: String, required: true },
  author: { type: String, required: true },
  comments: [{ body: String, date: Date }],
  date: { type: Date, default: Date.now },
  rating: Number,
});

module.exports = commentSchema;

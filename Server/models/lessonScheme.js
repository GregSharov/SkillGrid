import mongoose from "mongoose";
const { Schema } = mongoose;

const lessonSchema = new Schema({
    subjects: [
        {
            name: {
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
        }
    ]
});


module.exports = lessonSchema;
import mongoose from "mongoose";
const { Schema } = mongoose;

const subjectSchema = new Schema({
    subjects: [
        {
            name: {
                type: String,
                required: true,
                unique: true
            },
            image: {
                type: String,
                required: true,
            },
            description: {
                ype: String,
                required: true,
            },
            lessons: [
                {
                    name: {
                        type: String,
                        required: true,
                        unique: true
                    },
                    image: {
                        type: String,
                        required: true,
                    },
                    description: {
                        ype: String,
                        required: true,
                    },
                }
            ]
        }
    ]
});


module.exports = subjectSchema;
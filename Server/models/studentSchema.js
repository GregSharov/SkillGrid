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
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    subjects: [
        {
            name: {
                type: String,
                required: false,
                unique: false
            },
            themes: [
                {
                    type: String,
                    required: false
                }
            ]
        }
    ]
});


// module.exports = studentSchema;
const User = mongoose.model("Student", studentSchema, "Students");
export default User;
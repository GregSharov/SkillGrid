import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import User from "./models/studentScheme.js";


const uri = "mongodb+srv://GregAdmin:greg-25@cluster0.crqk0.mongodb.net/SkillGridDB?retryWrites=true&w=majority&appName=Cluster0";

const app = express();
const PORT = 3000;


app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB!'))
    .catch((err) => {
        console.error('Could not connect to MongoDB ' + err);
    });

// Retrieve the data from database to the user
app.get("/", (req, res) => {
    res.send("<h1>Server Side!</h1>");
});

// This function is used to add a new user to the database
app.post("/user/add", async (req, res) => {
    try {
        const { firstName, lastName, dateOfBirth, email, phone, password } = req.body;
        console.log("Received data:", firstName, lastName, dateOfBirth, email, phone, password);

        const newUser = new User(
            {
                firstName,
                lastName,
                dateOfBirth,
                email,
                phone,
                password
            }
        );

        const savedUser = await newUser.save();
        console.log("User saved:", savedUser);

        res.json({ message: `Received form for ${firstName} ${lastName}, ${dateOfBirth}, ${email}, ${phone}, ${password}` });
    } catch (error) {
        console.error("Error saving user:", error);
        res.status(500).json({ message: "Error saving user." });
    }
});

// Listen to a Server
app.listen(PORT, () => {
    console.log('Server runs on port ', PORT);
});
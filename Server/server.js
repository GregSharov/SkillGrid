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
    User.find()
        .then((items) => {
            console.log("Fetched data: ");
            items.forEach((item) => {
                console.log(item);
            });
            res.status(200).json(items);
        })
        .catch((err) => {
            console.error("Error fetching data: ", err);
            res.status(500).json(err);
        });
});

// This function is used to add a new user to the database
// app.post("/user/add", async (req, res) => {
//     try {
//         const { firstName, lastName, dateOfBirth, email, phone, password } = req.body;
//         console.log("Received data:", firstName, lastName, dateOfBirth, email, phone, password);

//         const newUser = new User(
//             {
//                 firstName,
//                 lastName,
//                 dateOfBirth,
//                 email,
//                 phone,
//                 password
//             }
//         );

//         const savedUser = await newUser.save();
//         console.log("User saved:", savedUser);

//         res.json({ message: `Received form for ${firstName} ${lastName}, ${dateOfBirth}, ${email}, ${phone}, ${password}` });
//     } catch (error) {
//         console.error("Error saving user:", error);
//         res.status(500).json({ message: "Error saving user." });
//     }
// });
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

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "User already exists." });
        } else {

            const savedUser = await newUser.save();
            console.log("User saved:", savedUser);

            res.json({ message: `Received form for ${firstName} ${lastName}, ${dateOfBirth}, ${email}, ${phone}, ${password}` });
        }
    } catch (error) {
        console.error("Error saving user:", error);
        res.status(500).json({ message: "Error saving user." });
    }
});

// This function is used to sign in a user
app.post("/user/signin", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Received data:", email, password);

        const user = await User.find({ email, password });
        console.log("User found:", user);

        // Check if user exists
        if (user.length === 0) {
            return res.status(401).json({ message: "Invalid email or password." });
        } else {
            // This place to redirect to user acount page !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            res.json({ message: `User found ${email}, ${password}` });
        }
    } catch (error) {
        console.error("Error signing in user:", error);
        res.status(500).json({ message: "Error signing in user." });
    }
});

// Listen to a Server
app.listen(PORT, () => {
    console.log('Server runs on port ', PORT);
});
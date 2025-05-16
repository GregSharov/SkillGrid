import mongoose from "mongoose";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import Student from "./models/studentSchema.js";
import { Subject } from "./models/subjectSchema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection string
const uri =
  "mongodb+srv://GregAdmin:greg-25@cluster0.crqk0.mongodb.net/SkillGridDB?retryWrites=true&w=majority&appName=Cluster0";

const app = express();
const PORT = 3000;

// Serve static image files
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(uri)
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => {
    console.error("Could not connect to MongoDB " + err);
  });

// Retrieve the data from students database
app.get("/students", (req, res) => {
  Student.find()
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

// Retrieve data from subjects database
app.get("/subjects", (req, res) => {
  Subject.find()
    .then((items) => {
      console.log("Fetched subjects data: ");
      items.forEach((item) => {
        console.log(item);
      });
      res.status(200).json(items);
    })
    .catch((err) => {
      console.error("Error fetching subjects data: ", err);
      res.status(500).json(err);
    });
});

// This function is used to add a new user to the database
app.post("/user/add", async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, email, phone, password } =
      req.body;
    console.log(
      "Received data:",
      firstName,
      lastName,
      dateOfBirth,
      email,
      phone,
      password
    );

    const newStudent = new Student({
      firstName,
      lastName,
      dateOfBirth,
      email,
      phone,
      password,
    });

    // Check if user already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      res.status(400).json({ message: "User already exists." });
    } else {
      const savedStudent = await newStudent.save();
      console.log("User saved:", savedStudent);

      res.status(201).json({
        message: `Received form for ${firstName} ${lastName}, ${dateOfBirth}, ${email}, ${phone}, ${password}`,
      });
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

    const user = await Student.find({ email, password });
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
  console.log("Server runs on port ", PORT);
});

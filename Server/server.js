import mongoose from "mongoose";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import session from "express-session";

// Routes
import userRoutes from "./routes/userRoute.js";
import studentRoutes from "./routes/studentRoute.js";
import teacherRoutes from "./routes/teacherRoute.js";
import subjectRoutes from "./routes/subjectRoute.js";
import scheduleLessonRoutes from "./routes/scheduleLessonRoute.js";
// import addSubjectRoutes from "./routes/addSubject.js";

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

// Session middleware
app.use(
  session({
    secret: "superSecretKey", // required (should be in .env)
    resave: false, // don't save session if not modified
    saveUninitialized: false, // don't create empty sessions
    cookie: { secure: false }, // true if using HTTPS
  })
);

// Connect to MongoDB
mongoose
  .connect(uri)
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => {
    console.error("Could not connect to MongoDB " + err);
  });

// Use Routers
app.use("/user", userRoutes);
app.use("/students", studentRoutes);
app.use("/teachers", teacherRoutes);
app.use("/subjects", subjectRoutes);
app.use("/schedule", scheduleLessonRoutes);
// app.use("/subject", addSubjectRoutes);

// Listen to a Server
app.listen(PORT, () => {
  console.log("Server runs on port ", PORT);
});

import dotenv from "dotenv";
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
import reviews from "./routes/reviews.js";
// import addSubjectRoutes from "./routes/addSubject.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "./.env") });

// MongoDB connection string
const uri = process.env.MONGO_URI;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "../client/build")));
// Serve static image files
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());

app.set("trust proxy", 1); // required for secure cookies on proxies

// Session middleware
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET, // required (should be in .env)
    resave: false, // don't save session if not modified
    saveUninitialized: false, // don't create empty sessions
    cookie: {
      httpOnly: true,
      sameSite: "lax", // dev same origin
      secure: process.env.NODE_ENV === "production", // set to true on production
      maxAge: 1000 * 60 * 60 * 24,
      path: "/",
    },
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
app.use("/reviews", reviews);
// app.use("/subject", addSubjectRoutes);

// Default Route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// Listen to a Server
app.listen(PORT, () => {
  console.log("Server runs on port ", PORT);
});

import mongoose from "mongoose";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";

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
dotenv.config();

const app = express();

// MongoDB connection string
const URI = process.env.MONGO_URI;
const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;
const isProd = process.env.NODE_ENV === "production";

// Trust proxy: required for secure cookies on Render (behind proxy)
app.set("trust proxy", 1);

// Serve static image files
app.use("/images", express.static(path.join(__dirname, "images")));

// Connect to MongoDB
mongoose
  .connect(URI)
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => {
    console.error("Could not connect to MongoDB " + err);
  });

// CORS (allow your frontend + localhost for dev)
const allowlist = [
  "http://localhost:3001",
  "http://localhost:5173",
  FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    credentials: true,
    origin(origin, cb) {
      if (!origin) return cb(null, true); // allow curl/Postman
      if (allowlist.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json());

// Session middleware
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET, // required (should be in .env)
    resave: false, // don't save session if not modified
    saveUninitialized: false, // don't create empty sessions
    cookie: {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax", // dev same origin
      secure: isProd, // send cookie over https only in production
      maxAge: 1000 * 60 * 60 * 24,
      path: "/",
    },
  })
);

// Use Routers
app.use("/user", userRoutes);
app.use("/students", studentRoutes);
app.use("/teachers", teacherRoutes);
app.use("/subjects", subjectRoutes);
app.use("/schedule", scheduleLessonRoutes);
app.use("/reviews", reviews);
// app.use("/subject", addSubjectRoutes);

// Health + welcome
app.get("/healthz", (req, res) => res.status(200).send("ok"));
app.get("*", (req, res) => {
  res.status(200).type("text/html").send("<h1>Welcome to Skill Grid API</h1>");
});

// Listen to a Server
app.listen(PORT, () => {
  console.log("Server runs on port ", PORT);
});

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();

const URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000; // fallback for local
const FRONTEND_URL = process.env.FRONTEND_URL;
const isProd = process.env.NODE_ENV === "production";

// Trust proxy (required for secure cookies on Render)
app.set("trust proxy", 1);

// Static files
app.use("/images", express.static(path.join(__dirname, "images")));

// CORS allowlist
const allowlist = [
  "http://localhost:3001",
  "http://localhost:5173",
  FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    credentials: true,
    origin(origin, cb) {
      if (!origin) return cb(null, true); // curl/Postman
      if (allowlist.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json());

// Sessions
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      maxAge: 1000 * 60 * 60 * 24,
      path: "/",
    },
  })
);

// Routers (make sure inside each file you use `router.get('/')`, not `'/teachers'` again)
app.use("/user", userRoutes);
app.use("/students", studentRoutes);
app.use("/teachers", teacherRoutes);
app.use("/subjects", subjectRoutes);
app.use("/schedule", scheduleLessonRoutes);
app.use("/reviews", reviews);

// Diagnostics
app.get("/healthz", (req, res) => res.status(200).send("ok"));
app.get(
  "/dbcheck",
  (req, res) => res.json({ mongoState: mongoose.connection.readyState }) // 0=disconnected, 1=connected
);

// JSON error handler (after routes, before catch-all)
app.use((err, req, res, next) => {
  console.error("Route error:", req.method, req.originalUrl);
  console.error(err?.stack || err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

// Catch-all
app.get("*", (req, res) => {
  res.status(200).type("text/html").send("<h1>Welcome to Skill Grid API</h1>");
});

// Start only after Mongo connects
(async () => {
  try {
    await mongoose.connect(URI, {
      serverSelectionTimeoutMS: 8000, // fail fast with a clear message
      socketTimeoutMS: 20000,
    });
    console.log("Connected to MongoDB!");
    app.listen(PORT, "0.0.0.0", () => console.log("Server runs on port", PORT));
  } catch (e) {
    console.error("Mongo connect failed:", e);
    process.exit(1);
  }
})();

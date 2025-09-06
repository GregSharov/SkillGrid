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

// MongoDB connection string
const uri =
  "mongodb+srv://GregAdmin:greg-25@cluster0.crqk0.mongodb.net/SkillGridDB?retryWrites=true&w=majority&appName=Cluster0";

const app = express();
// const PORT = 3000;
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGINS = [
  "http://localhost:3001",                 // local dev (React)
  "https://skillgrid-client.onrender.com", // your Render static site
];

const isProd = process.env.NODE_ENV === "production";
app.set("trust proxy", 1); // IMPORTANT on Render for secure cookies


// Serve static image files
app.use("/images", express.static(path.join(__dirname, "images")));
// app.use(cors({ credentials: true, origin: "http://localhost:3001" }));
// app.use(
//   cors({
//     origin(origin, cb) {
//       // allow server-to-server or tools with no Origin
//       if (!origin) return cb(null, true);
//       // allow only from the list above
//       if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
//       return cb(new Error(`CORS blocked for origin: ${origin}`), false);
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );
app.use(
  cors({
    origin: ["https://skillgrid-client.onrender.com"],
    credentials: true,
  })
);
app.use(express.json());

// Session middleware
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "superSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax", // cross-site requires "none"
      secure: isProd,                    // must be true with "none" (HTTPS)
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

// Listen to a Server
app.listen(PORT, () => {
  console.log("Server runs on port ", PORT);
});

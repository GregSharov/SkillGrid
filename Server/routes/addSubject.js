import express from "express";
import { Subject } from "../models/subjectSchema.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  try {
    const newSubject = new Subject(req.body);
    await newSubject.save();
    res.status(201).json({ message: "Subject added successfully!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

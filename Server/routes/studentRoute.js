import express from "express";
import Student from "../models/studentSchema.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch students." });
  }
});

export default router;

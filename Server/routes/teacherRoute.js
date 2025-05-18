import express from "express";
import Teacher from "../models/teacherSchema.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch teachers." });
  }
});

export default router;

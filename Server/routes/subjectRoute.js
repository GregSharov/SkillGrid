import express from "express";
import { Subject } from "../models/subjectSchema.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subjects." });
  }
});

export default router;

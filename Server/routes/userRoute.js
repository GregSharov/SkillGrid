import express from "express";
import Student from "../models/studentSchema.js";
import Teacher from "../models/teacherSchema.js";
import { Subject } from "../models/subjectSchema.js";
import { Schedule } from "../models/scheduleSchema.js";
import { HashPassword, VerifyPassword } from "../utils/auth.js";
import multer from "multer";
import uploadImage from "./cloudinary.js";
import { sendInformationEmail } from "../utils/aiNotification.js";
import { sendEmail } from "../utils/sendEmail.js";

const router = express.Router();

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

var Model = Student;

// Upload profile image
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const { userId, directUpload } = req.body;

    // For direct uploads (new items), just upload to Cloudinary without user association
    if (directUpload === "true") {
      const cloudinaryResult = await new Promise((resolve, reject) => {
        const stream = uploadImage.uploader.upload_stream(
          {
            folder: `SkillGrid/images/temp`,
            public_id: `temp_${Date.now()}`,
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(req.file.buffer);
      });

      return res.status(200).json({
        message: "Image uploaded successfully.",
        imageUrl: cloudinaryResult.secure_url,
      });
    }

    // For existing users, update their profile
    let subfolder = "";
    if (await Student.findById(userId)) {
      Model = Student;
      subfolder = "students";
    } else if (await Teacher.findById(userId)) {
      Model = Teacher;
      subfolder = "teachers";
    } else if (await Subject.findById(userId)) {
      Model = Subject;
      subfolder = "subjects";
    } else {
      subfolder = "lessons";
    }

    // Upload buffer to Cloudinary in nested folder
    const cloudinaryResult = await new Promise((resolve, reject) => {
      const stream = uploadImage.uploader.upload_stream(
        {
          folder: `SkillGrid/images/${subfolder}`,
          public_id: userId, // file will always be named after the userId
          overwrite: true,
        },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      stream.end(req.file.buffer);
    });

    // Update user with Cloudinary URL
    const user = await Model.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.image = cloudinaryResult.secure_url;
    await user.save();

    res.status(200).json({
      message: "Profile image uploaded successfully.",
      imageUrl: cloudinaryResult.secure_url,
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    res.status(500).json({ message: "Error uploading profile image." });
  }
});

// Sign Up user
router.post("/signup", async (req, res) => {
  const {
    firstName,
    lastName,
    dateOfBirth,
    email,
    phone,
    password,
    isTeacher,
  } = req.body;
  try {
    // Detect correct model (Student or Teacher)
    Model = isTeacher ? Teacher : Student;

    // Check if user already exists
    const existingUser = await Model.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash the password
    const hashedPassword = await HashPassword(password);

    // Create new user
    const newUser = new Model({
      firstName,
      lastName,
      dateOfBirth,
      email,
      phone,
      password: hashedPassword,
      isTeacher,
    });

    await newUser.save();
    // Send congratulation email to user
    const aiMsg = await sendInformationEmail({
      recipientName: `${firstName} ${lastName}`,
      recipientEmail: email,
      actionType: "signed up",
    });

    await sendEmail({
      to: email,
      subject: aiMsg.subject,
      text: aiMsg.message,
    });

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Error signing up user:", error);
    res.status(500).json({ message: "Error signing up user." });
  }
});

// Login user
router.post("/login", async (req, res) => {
  const { email, password, isTeacher } = req.body;

  try {
    Model = isTeacher ? Teacher : Student;
    const user = await Model.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    const ok = await VerifyPassword(user.password, password);

    if (!ok) return res.status(401).json({ message: "Invalid password." });

    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ message: "Session error." });

      req.session.user = {
        id: user._id,
        role: user.isTeacher ? "teacher" : "student",
      };

      req.session.save((err2) => {
        if (err2)
          return res.status(500).json({ message: "Session save failed." });

        // <-- Only respond after save so Set-Cookie definitely goes out
        return res
          .status(200)
          .json({ message: "Login successful.", user: req.session.user });
      });
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error logging in user." });
  }
});

// Get current logged in user (id, role)
router.get("/me", async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    return res.status(200).json({ user: user });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Error fetching user data." });
  }
});

// Get full object user by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = (await Student.findById(id)) || (await Teacher.findById(id));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "Error fetching user by ID." });
  }
});

// PUT update user
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, dateOfBirth, password, image, subjects } = req.body;

    const updateData = {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      image
    };

    // Only hash password if provided
    if (password) {
      updateData.password = await HashPassword(password);
    }

    // Update subjects if provided
    if (subjects) {
      updateData.subjects = subjects;
    }

    Model = (await Student.findById(id)) ? Student : Teacher;
    const user = await Model.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to update user.", error: error.message });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    Model = (await Student.findById(id)) ? Student : Teacher;
    const user = await Model.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send email to user
    const aiMsg = await sendInformationEmail({
      recipientName: `${user.firstName} ${user.lastName}`,
      recipientEmail: user.email,
      actionType: "deleted",
    });

    await sendEmail({
      to: user.email,
      subject: aiMsg.subject,
      text: aiMsg.message,
    });

    // Delete all scheduled lessons associated with this user (as teacher or student)
    await Schedule.deleteMany({
      $or: [
        { "teacher._id": id },
        { "student._id": id }
      ]
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user.", error: error.message });
  }
});


// Logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error logging out:", err);
      return res.status(500).json({ message: "Error logging out." });
    }
    res.clearCookie("sid", { path: "/" });
    res.status(200).json({ message: "Logout successful." });
  });
});

// Put subjects and lessons to account
router.put("/:id/subjects", async (req, res) => {
  const { id } = req.params;
  const { subjects, lessons } = req.body; // from React

  try {
    // Find teacher or student
    let user = await Student.findById(id);
    if (!user) {
      user = await Teacher.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
    }

    // Fetch all selected subject documents from DB
    const allSubjects = await Subject.find({
      _id: { $in: subjects.map((s) => s.value) },
    });

    // Start with existing user subjects
    const updatedSubjects = [...user.subjects];

    allSubjects.forEach((subj) => {
      const selectedLessons = lessons[subj._id] || [];

      // Find full lesson docs for selected lessons
      const embeddedLessons = subj.lessons.filter((lesson) =>
        selectedLessons.some((sel) => sel.value === lesson._id.toString())
      );

      // Check if this subject already exists for user
      const existingIndex = updatedSubjects.findIndex(
        (s) => s._id.toString() === subj._id.toString()
      );

      if (existingIndex >= 0) {
        // Update lessons for existing subject
        updatedSubjects[existingIndex].lessons = embeddedLessons.map(
          (lesson) => ({
            _id: lesson._id,
            name: lesson.name,
            image: lesson.image,
            description: lesson.description,
          })
        );
      } else {
        // Add as a new subject
        updatedSubjects.push({
          _id: subj._id,
          name: subj.name,
          image: subj.image,
          description: subj.description,
          lessons: embeddedLessons.map((lesson) => ({
            _id: lesson._id,
            name: lesson.name,
            image: lesson.image,
            description: lesson.description,
          })),
        });
      }
    });

    // Remove any subjects that are no longer selected
    const selectedIds = subjects.map((s) => s.value.toString());
    const finalSubjects = updatedSubjects.filter((s) =>
      selectedIds.includes(s._id.toString())
    );

    // Save changes
    user.subjects = finalSubjects;
    await user.save();

    res.status(200).json({
      message: "Subjects and lessons updated successfully",
      subjects: user.subjects,
    });
  } catch (err) {
    console.error("Error updating subjects:", err);
    res.status(500).json({ message: "Server error updating subjects" });
  }
});

export default router;

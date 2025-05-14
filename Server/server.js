import mongoose from "mongoose";
import express from "express";
import cors from "cors";

const uri = "mongodb+srv://GregAdmin:greg-25@cluster0.crqk0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const app = express();
const PORT = 3000;


app.use(cors());
app.use(express.json());


mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB!'))
    .catch((err) => {
        console.error('Could not connect to MongoDB ' + err);
    });


app.get("/", (req, res) => {
    res.send("<h1>Server Side!</h1>");
});

app.post("/user/add", (req, res) => {
    const { firstName, secondName, dateOfBirth, email, phone, password } = req.body;
    console.log("Received data:", firstName, secondName, dateOfBirth, email, phone, password);
    res.json({ message: `Received form for ${firstName} ${secondName}, ${dateOfBirth}, ${email}, ${phone}, ${password}` });
});

app.listen(PORT, () => {
    console.log('Server runs on port ', PORT);
});
import { useState } from "react";

function AddNewUser() {
    const [formData, setFormData] = useState({ name: "" });
    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const res = await fetch("http://localhost:3000/user/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await res.json();
        alert(`Server says: ${data.message}`);
    };

    return (
        <div>
            <h2>Welcome</h2>
            <form onSubmit={handleSubmit}>
                <label for="firstName">First name</label>
                <input type="text" id="firstName" name="firstName" onChange={handleChange} placeholder="Enter a first name" required />
                {/* <lable for="secondName">Second name</lable>
                <input type="text" id="secondName" placeholder="Enter a second name" required></input>
                <lable for="dateOfBirth">Date of birth</lable>
                <input type="date" id="dateOfBirth" placeholder="Enter your date of birth" required></input>
                <lable for="email">Email</lable>
                <input type="email" id="email" placeholder="Enter an email" required></input>
                <lable for="phone">Phone</lable>
                <input type="tel" id="phone" pattern="[0-9]{10}" placeholder="Enter phone number" required></input>
                <label for="password">Password</label>
                <input type="text" id="password" placeholder="Enter a password" required></input> */}
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default AddNewUser;
import { useState } from "react";

function AddNewUser() {
    const [formData, setFormData] = useState(
        {
            firstName: "",
            lastName: "",
            dateOfBirth: "",
            email: "",
            phone: "",
            password: ""
        });

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
                <label for="lastName">Second name</label>
                <input type="text" id="lastName" name="lastName" onChange={handleChange} placeholder="Enter a second name" required />
                <label for="dateOfBirth">Date of birth</label>
                <input type="date" id="dateOfBirth" name="dateOfBirth" onChange={handleChange} placeholder="Enter your date of birth" required />
                <label for="email">Email</label>
                <input type="email" id="email" name="email" onChange={handleChange} placeholder="Enter an email" required />
                <label for="phone">Phone</label>
                <input type="tel" id="phone" name="phone" onChange={handleChange} pattern="[0-9]{10}" placeholder="Enter phone number" required />
                <label for="password">Password</label>
                <input type="password" id="password" name="password" onChange={handleChange} placeholder="Enter a password" required />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default AddNewUser;
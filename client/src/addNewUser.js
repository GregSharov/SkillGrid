import { useState } from "react";

// Add a new user to the database
function AddNewUser() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    password: "",
    isTeacher: false,
  });

  // Universal input handler (including checkbox)
  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle form submission and send data to the server
  const handleSubmit = async (event) => {
    event.preventDefault();

    const res = await fetch("http://localhost:3000/user/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    alert(`Server says: ${data.message}`);

    // Reset the form
    setFormData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      email: "",
      phone: "",
      password: "",
      isTeacher: false,
    });
  };

  // Render the form
  return (
    <div>
      <h2>Welcome</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="firstName">First name</label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="Enter a first name"
          required
        />

        <label htmlFor="lastName">Second name</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Enter a second name"
          required
        />

        <label htmlFor="dateOfBirth">Date of birth</label>
        <input
          type="date"
          id="dateOfBirth"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter an email"
          required
        />

        <label htmlFor="phone">Phone</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          pattern="[0-9]{10}"
          placeholder="Enter phone number"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter a password"
          required
        />

        <label htmlFor="isTeacher">I am a teacher</label>
        <input
          type="checkbox"
          id="isTeacher"
          name="isTeacher"
          checked={formData.isTeacher}
          onChange={handleChange}
        />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default AddNewUser;

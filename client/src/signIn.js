import { useState } from "react";

// This function is used to sign in a user
function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  // This function is used to handle form submission and send data to the server
  const handleSubmit = async (event) => {
    event.preventDefault();

    const res = await fetch("http://localhost:3000/user/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    alert(`Server says: ${data.message}`);
  };

  // This function is used to render the form
  return (
    <div>
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          onChange={handleChange}
          placeholder="Enter an email"
          required
        />
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          onChange={handleChange}
          placeholder="Enter a password"
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default SignIn;

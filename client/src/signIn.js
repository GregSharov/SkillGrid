import { useState } from "react";
import { useNavigate } from "react-router-dom";

// This function is used to sign in a user
function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    isTeacher: false,
  });
  const [error, setError] = useState(false);

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // This function is used to handle form submission and send data to the server
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/user/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json(); // Always parse JSON regardless of status

      if (res.ok) {
        setError(false);
        console.log("Login successful");
        const userId = data.user.id;
        const isTeacher = data.user.isTeacher;
        openAccountPage(userId, isTeacher);
      } else {
        setError(true);
        console.error("Login failed:", data.message);
      }
    } catch (err) {
      console.error("Error during login:", err);
    }
  };

  // This function is used to navigate to the account page after successful login
  const navigate = useNavigate();
  const openAccountPage = (userId, isTeacher) => {
    navigate("/account", { state: { userId, isTeacher } });
  };

  // This function is used to render the form
  return (
    <main className="mx-auto flex min-h-screen w-full items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleSubmit}>
        <section className="flex w-[30rem] flex-col space-y-10">
          <div className="text-center text-4xl font-medium">Log In</div>

          <div className="w-full transform border-b-2 bg-transparent text-lg duration-300 focus-within:border-indigo-500">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              className={`w-full border-b-2 bg-transparent text-lg outline-none placeholder:italic duration-300`}
            />
          </div>

          <div className="w-full transform border-b-2 bg-transparent text-lg duration-300 focus-within:border-indigo-500">
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className={`w-full border-b-2 bg-transparent text-lg outline-none placeholder:italic duration-300`}
            />
          </div>
          {error && (
            <p className="text-sm text-red-500 text-center">
              Please check email or password or "I am a teacher" box.
            </p>
          )}
          <div className="">
            <label
              htmlFor="isTeacher"
              className="flex items-center w-full transform bg-transparent text-lg duration-300 focus-within:border-indigo-500"
            >
              <input
                type="checkbox"
                id="isTeacher"
                name="isTeacher"
                checked={formData.isTeacher}
                onChange={handleChange}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-xl text-gray-400">I am a teacher</span>
            </label>
          </div>

          <button
            type="submit"
            className="transform rounded-sm bg-indigo-600 py-2 font-bold duration-300 hover:bg-indigo-400"
          >
            LOG IN
          </button>

          <p className="text-center text-lg">
            No account?
            <a
              href="./sign-up"
              className="font-medium text-indigo-500 underline-offset-4 hover:underline"
            >
              {" "}
              Create One
            </a>
          </p>
        </section>
      </form>
    </main>
  );
}

export default SignIn;

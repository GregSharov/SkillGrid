import { useState } from "react";

function SignUp() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    password: "",
    isTeacher: false,
  });

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      alert(`Server says: ${data.message}`);

      setFormData({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        email: "",
        phone: "",
        password: "",
        isTeacher: false,
      });
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <main className="min-h-screen bg-white py-16 px-6">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-800">Sign Up</h1>
        <p className="mt-4 text-lg text-gray-600">
          Create a new account to start using Skill Grid.
        </p>
      </div>

      <div className="max-w-md mx-auto bg-gray-50 shadow-md rounded-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* First Name */}
          <div className="text-left">
            <label
              htmlFor="firstName"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            />
          </div>

          {/* Last Name */}
          <div className="text-left">
            <label
              htmlFor="lastName"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            />
          </div>

          {/* Date of Birth */}
          <div className="text-left">
            <label
              htmlFor="dateOfBirth"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            />
          </div>

          {/* Email */}
          <div className="text-left">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            />
          </div>

          {/* Phone */}
          <div className="text-left">
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              pattern="[0-9]{10}"
              placeholder="Enter phone number"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            />
          </div>

          {/* Password */}
          <div className="text-left">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter a password"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            />
          </div>

          {/* Teacher checkbox */}
          <div className="flex items-center text-left">
            <input
              type="checkbox"
              id="isTeacher"
              name="isTeacher"
              checked={formData.isTeacher}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isTeacher" className="ml-2 text-sm text-gray-700">
              I am a teacher
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-md bg-indigo-500 px-4 py-2 font-semibold text-white shadow-md hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          >
            Sign Up
          </button>
        </form>
      </div>
    </main>
  );
}

export default SignUp;

// import { useState } from "react";

// // Add a new user to the database
// function AddNewUser() {
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     dateOfBirth: "",
//     email: "",
//     phone: "",
//     password: "",
//     isTeacher: false,
//   });

//   // Universal input handler (including checkbox)
//   const handleChange = (event) => {
//     const { name, type, value, checked } = event.target;
//     setFormData({
//       ...formData,
//       [name]: type === "checkbox" ? checked : value,
//     });
//   };

//   // Handle form submission and send data to the server
//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     const res = await fetch("http://localhost:3000/user/add", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(formData),
//     });

//     const data = await res.json();
//     alert(`Server says: ${data.message}`);

//     // Reset the form
//     setFormData({
//       firstName: "",
//       lastName: "",
//       dateOfBirth: "",
//       email: "",
//       phone: "",
//       password: "",
//       isTeacher: false,
//     });
//   };

//   // Render the form
//   return (
//     <main className="mx-auto flex min-h-screen w-full items-center justify-center bg-gray-100 text-black">
//       <form onSubmit={handleSubmit}>
//         <section className="flex w-[30rem] flex-col space-y-10">
//           <div className="text-center text-4xl font-medium">Sign Up</div>

//           <div className="w-full transform border-b-2 bg-transparent text-lg duration-300 focus-within:border-indigo-500">
//             <input
//               type="text"
//               id="firstName"
//               name="firstName"
//               value={formData.firstName}
//               onChange={handleChange}
//               placeholder="First name"
//               required
//               className="w-full border-none bg-transparent outline-none placeholder:italic focus:outline-none"
//             />
//           </div>

//           <div className="w-full transform border-b-2 bg-transparent text-lg duration-300 focus-within:border-indigo-500">
//             <input
//               type="text"
//               id="lastName"
//               name="lastName"
//               value={formData.lastName}
//               onChange={handleChange}
//               placeholder="Last name"
//               required
//               className="w-full border-none bg-transparent outline-none placeholder:italic focus:outline-none"
//             />
//           </div>

//           <div className="w-full transform border-b-2 bg-transparent text-lg duration-300 focus-within:border-indigo-500">
//             <input
//               type="date"
//               id="dateOfBirth"
//               name="dateOfBirth"
//               value={formData.dateOfBirth}
//               onChange={handleChange}
//               required
//               className="w-full border-none bg-transparent outline-none placeholder:italic focus:outline-none"
//             />
//           </div>

//           <div className="w-full transform border-b-2 bg-transparent text-lg duration-300 focus-within:border-indigo-500">
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="Email Address"
//               required
//               className="w-full border-none bg-transparent outline-none placeholder:italic focus:outline-none"
//             />
//           </div>

//           <div className="w-full transform border-b-2 bg-transparent text-lg duration-300 focus-within:border-indigo-500">
//             <input
//               type="tel"
//               id="phone"
//               name="phone"
//               value={formData.phone}
//               onChange={handleChange}
//               pattern="[0-9]{10}"
//               placeholder="Enter phone number"
//               required
//               className="w-full border-none bg-transparent outline-none placeholder:italic focus:outline-none"
//             />
//           </div>

//           <div className="w-full transform border-b-2 bg-transparent text-lg duration-300 focus-within:border-indigo-500">
//             <input
//               type="password"
//               id="password"
//               name="password"
//               onChange={handleChange}
//               placeholder="Password"
//               required
//               className="w-full border-none bg-transparent outline-none placeholder:italic focus:outline-none"
//             />
//           </div>

//           <div className="">
//             <label
//               htmlFor="isTeacher"
//               className="flex items-center w-full transform bg-transparent text-lg duration-300 focus-within:border-indigo-500"
//             >
//               <input
//                 type="checkbox"
//                 id="isTeacher"
//                 name="isTeacher"
//                 checked={formData.isTeacher}
//                 onChange={handleChange}
//                 className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
//               />
//               <span className="ml-2 text-xl text-gray-400">I am a teacher</span>
//             </label>
//           </div>

//           <button
//             type="submit"
//             className="transform rounded-sm bg-indigo-400 py-2 font-bold duration-300 hover:bg-indigo-400"
//           >
//             SIGN UP
//           </button>
//         </section>
//       </form>
//     </main>
//   );
// }

// export default AddNewUser;

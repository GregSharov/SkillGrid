import { useState } from "react";

// This function is used to sign in a user
function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
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

      <main className="mx-auto flex min-h-screen w-full items-center justify-center bg-gray-900 text-white">
        <form onSubmit={handleSubmit}>
          <section className="flex w-[30rem] flex-col space-y-10">
            <div className="text-center text-4xl font-medium">Sign In</div>

            <div className="w-full transform border-b-2 bg-transparent text-lg duration-300 focus-within:border-indigo-500">
              <input
                type="email"
                id="email"
                name="email"
                onChange={handleChange}
                placeholder="Email Address"
                required
                className="w-full border-none bg-transparent outline-none placeholder:italic focus:outline-none"/>
            </div>

            <div className="w-full transform border-b-2 bg-transparent text-lg duration-300 focus-within:border-indigo-500">
              <input
                type="password"
                id="password"
                name="password"
                onChange={handleChange}
                placeholder="Password"
                required
                className="w-full border-none bg-transparent outline-none placeholder:italic focus:outline-none"/>
            </div>
            <div class="">
              <label for="isTeacher" className="flex items-center w-full transform bg-transparent text-lg duration-300 focus-within:border-indigo-500">
                <input
                  type="checkbox"
                  id="isTeacher"
                  name="isTeacher"
                  checked={formData.isTeacher}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                  <span class="ml-2 text-xl text-gray-400">I am a teacher</span>
              </label>
            </div>

            <button type="submit" className="transform rounded-sm bg-indigo-600 py-2 font-bold duration-300 hover:bg-indigo-400">SIGN IN</button>

            <p className="text-center text-lg">
              No account?  
              <a href="./sign-up" className="font-medium text-indigo-500 underline-offset-4 hover:underline"> Create One</a>
            </p>
          </section>
        </form>
      </main>
  

    




    //   <h2>Sign In</h2>
    //   <form onSubmit={handleSubmit}>
    //     <label for="email">Email</label>
    //     <input
    //       type="email"
    //       id="email"
    //       name="email"
    //       onChange={handleChange}
    //       placeholder="Enter an email"
    //       required
    //     />
    //     <label for="password">Password</label>
    //     <input
    //       type="password"
    //       id="password"
    //       name="password"
    //       onChange={handleChange}
    //       placeholder="Enter a password"
    //       required
    //     />
    //     <label for="isTeacher">I am a teacher</label>
    //     <input
    //       type="checkbox"
    //       id="isTeacher"
    //       name="isTeacher"
    //       checked={formData.isTeacher}
    //       onChange={handleChange}
    //     />
    //     <button type="submit">Submit</button>
    //   </form>
    // </div>
  );
}

export default SignIn;

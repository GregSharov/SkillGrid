import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-white py-16 px-6">
      {/* Title Section */}
      <div className="max-w-5xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-4">
          Contact Us
        </h1>
        <p className="text-lg text-gray-600">
          We’re here to help with any questions about Skill Grid. Reach out
          using the information below or send us a message.
        </p>
      </div>

      {/* Contact Info Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
        <div className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-md transition flex flex-col items-center text-center">
          <FaPhoneAlt className="text-blue-500 text-4xl mb-4" />
          <h3 className="font-bold text-xl mb-2">Phone</h3>
          <p className="text-gray-600">+1 234 567 890</p>
        </div>

        <div className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-md transition flex flex-col items-center text-center">
          <FaEnvelope className="text-green-500 text-4xl mb-4" />
          <h3 className="font-bold text-xl mb-2">Email</h3>
          <p className="text-gray-600">example@example.com</p>
        </div>

        <div className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-md transition flex flex-col items-center text-center">
          <FaMapMarkerAlt className="text-red-500 text-4xl mb-4" />
          <h3 className="font-bold text-xl mb-2">Address</h3>
          <p className="text-gray-600">123 Education St, Learning City</p>
        </div>
      </div>

      {/* Contact Form */}
      <div className="max-w-3xl mx-auto bg-gray-50 rounded-xl shadow p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Send us a message
        </h2>
        <form className="space-y-5">
          <div>
            <input
              type="text"
              placeholder="Your name"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Your email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <textarea
              rows="4"
              placeholder="Your message"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;

// const contact = () => {
//   return (
//     <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
//       <h1 className="text-4xl font-bold mb-4">About Us</h1>
//       <p className="text-lg text-center max-w-2xl">
//        The phone number is 1234567890 and the email is example@example.com
//       </p>
//     </div>
//   );
// }
// export default contact;

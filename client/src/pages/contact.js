import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50/40 py-16 px-6">
      {/* Title Section */}
      <div className="max-w-5xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-extrabold text-slate-900 mb-4">
          Contact Us
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          We’re here to help with any questions about{" "}
          <span className="font-semibold text-indigo-600">Skill Grid</span>.
          Reach out using the information below or send us a message.
        </p>
      </div>

      {/* Contact Info Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
        <div className="p-8 bg-white rounded-3xl shadow-lg ring-1 ring-slate-200 hover:shadow-xl transition flex flex-col items-center text-center">
          <FaPhoneAlt className="text-indigo-500 text-4xl mb-4" />
          <h3 className="font-bold text-xl text-slate-900 mb-2">Phone</h3>
          <h6 className="font-bold text-slate-900 mb-2 mt-4">Gregory</h6>
          <p className="text-slate-600">+972 50-221-9630</p>
          <h6 className="font-bold text-slate-900 mb">Ivan</h6>
          <p className="text-slate-600">+972 54-834-6620</p>
        </div>

        <div className="p-8 bg-white rounded-3xl shadow-lg ring-1 ring-slate-200 hover:shadow-xl transition flex flex-col items-center text-center">
          <FaEnvelope className="text-emerald-500 text-4xl mb-4" />
          <h3 className="font-bold text-xl text-slate-900 mb-2">Email</h3>
          <h6 className="font-bold text-slate-900 mb-2 mt-4">Gregory</h6>
          <p className="text-slate-600">grigorysharov@icloud.com</p>
          <h6 className="font-bold text-slate-900 mb">Ivan</h6>
          <p className="text-slate-600">Latishovi@gmail.com</p>
        </div>

        <div className="p-8 bg-white rounded-3xl shadow-lg ring-1 ring-slate-200 hover:shadow-xl transition flex flex-col items-center text-center">
          <FaMapMarkerAlt className="text-rose-500 text-4xl mb-4" />
          <h3 className="font-bold text-xl text-slate-900 mb-2">Address</h3>
          <p className="text-lg text-slate-600">Israel</p>
          <p className="text-slate-600">City Ashkelon</p>
        </div>
      </div>

      {/* Contact Form */}
      {/* <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg ring-1 ring-slate-200 p-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
          Send us a message
        </h2>
        <form className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Your name"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Your email"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
            />
          </div>
          <div>
            <textarea
              rows="4"
              placeholder="Your message"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-md transition active:scale-[0.98]"
          >
            Send Message
          </button>
        </form>
      </div> */}
    </div>
  );
};

export default ContactUs;

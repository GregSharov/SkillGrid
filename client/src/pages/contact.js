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
          <a href="mailto:grigorysharov@icloud.com"
            className="text-indigo-600 font-medium hover:underline">
              grigorysharov@icloud.com
          </a>
          <h6 className="font-bold text-slate-900 mb">Ivan</h6>
          <a href="mailto:Latishovi@gmail.com"
            className="text-indigo-600 font-medium hover:underline">
              Latishovi@gmail.com
          </a>
        </div>

        <div className="p-8 bg-white rounded-3xl shadow-lg ring-1 ring-slate-200 hover:shadow-xl transition flex flex-col items-center text-center">
          <FaMapMarkerAlt className="text-rose-500 text-4xl mb-4" />
          <h3 className="font-bold text-xl text-slate-900 mb-2">Address</h3>
          <p className="text-lg text-slate-600">Israel</p>
          <p className="text-slate-600">City Ashkelon</p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;

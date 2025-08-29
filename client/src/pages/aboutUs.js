import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaVideo,
  FaClock,
} from "react-icons/fa";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50/40 py-16 px-6">
      {/* Title Section */}
      <div className="max-w-5xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-extrabold text-slate-900 mb-4">
          About <span className="text-indigo-600">Skill Grid</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          A platform designed for{" "}
          <span className="font-medium">real-time, one-on-one learning</span>{" "}
          experiences.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
        <div className="p-8 bg-white rounded-3xl shadow-lg ring-1 ring-slate-200 hover:shadow-xl transition text-center">
          <FaUserGraduate className="text-indigo-500 text-5xl mx-auto mb-4" />
          <h3 className="font-bold text-xl text-slate-900 mb-2">
            For Students
          </h3>
          <p className="text-slate-600">
            Find lessons, teachers, and schedules tailored to your learning
            goals.
          </p>
        </div>

        <div className="p-8 bg-white rounded-3xl shadow-lg ring-1 ring-slate-200 hover:shadow-xl transition text-center">
          <FaChalkboardTeacher className="text-emerald-500 text-5xl mx-auto mb-4" />
          <h3 className="font-bold text-xl text-slate-900 mb-2">
            For Teachers
          </h3>
          <p className="text-slate-600">
            Share your expertise, manage your schedule, and teach from anywhere.
          </p>
        </div>

        <div className="p-8 bg-white rounded-3xl shadow-lg ring-1 ring-slate-200 hover:shadow-xl transition text-center">
          <FaVideo className="text-purple-500 text-5xl mx-auto mb-4" />
          <h3 className="font-bold text-xl text-slate-900 mb-2">
            Live Classes
          </h3>
          <p className="text-slate-600">
            Engage in real-time video lessons for a fully interactive
            experience.
          </p>
        </div>

        <div className="p-8 bg-white rounded-3xl shadow-lg ring-1 ring-slate-200 hover:shadow-xl transition text-center">
          <FaClock className="text-amber-500 text-5xl mx-auto mb-4" />
          <h3 className="font-bold text-xl text-slate-900 mb-2">
            Anytime, Anywhere
          </h3>
          <p className="text-slate-600">
            Learn or teach from anywhere with flexible scheduling options.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;

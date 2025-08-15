import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaVideo,
  FaClock,
} from "react-icons/fa";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white py-16 px-6">
      <div className="max-w-5xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-4">
          About Skill Grid
        </h1>
        <p className="text-lg text-gray-600">
          A platform designed for real-time, one-on-one learning experiences.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
        <div className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-md transition">
          <FaUserGraduate className="text-blue-500 text-4xl mb-4" />
          <h3 className="font-bold text-xl mb-2">For Students</h3>
          <p className="text-gray-600">
            Find lessons, teachers, and schedules tailored to your learning
            goals.
          </p>
        </div>

        <div className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-md transition">
          <FaChalkboardTeacher className="text-green-500 text-4xl mb-4" />
          <h3 className="font-bold text-xl mb-2">For Teachers</h3>
          <p className="text-gray-600">
            Share your expertise, manage your schedule, and teach from anywhere.
          </p>
        </div>

        <div className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-md transition">
          <FaVideo className="text-purple-500 text-4xl mb-4" />
          <h3 className="font-bold text-xl mb-2">Live Classes</h3>
          <p className="text-gray-600">
            Engage in real-time video lessons for a fully interactive
            experience.
          </p>
        </div>

        <div className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-md transition">
          <FaClock className="text-orange-500 text-4xl mb-4" />
          <h3 className="font-bold text-xl mb-2">Anytime, Anywhere</h3>
          <p className="text-gray-600">
            Learn or teach from anywhere with flexible scheduling options.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;

// const aboutUs = () => {
//   return (
//     <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
//       <h1 className="text-4xl  font-bold mb-4">Skill Grid</h1>
//       <p className="text-lg text-center max-w-2xl">
//         The website is designed to provide a convenient and fast opportunity for anyone interested in expanding and deepening their knowledge in a wide range of subjects, through real-time learning with a private teacher in a virtual classroom via video communication.
//       </p><br />
//       <p className="text-lg text-center max-w-2xl">
//         Students who wish to acquire new knowledge or deepen their understanding in a specific field can register on the site or log in as registered users, and enjoy a pleasant and user-friendly interface that allows for personalized search and selection of subjects, topics, lessons, and teachers. A focused search can be performed through the search bar, or users can choose from a collection of cards categorized by fields of study. Afterwards, the student selects the desired lesson, a suitable teacher, and the preferred date and time.
//       </p><br />
//       <p className="text-lg text-center max-w-2xl">
//         The site also caters to those who wish to teach and share their knowledge. Teachers can register, define their areas of expertise, specify their professional and teaching experience, and set a schedule for their lessons.
//       </p><br />
//       <p className="text-lg text-center max-w-2xl">
//         Once the scheduled time for a lesson arrives, both the teacher and the student enter the virtual classroom through their accounts and begin an engaging, professional, and in-depth video lesson.
//       </p><br />
//       <p className="text-lg text-center max-w-2xl">
//         The site's main service is real-time video lessons – personalized learning, from anywhere and at any time.
//       </p>
//     </div>
//   );
// }
// export default aboutUs;

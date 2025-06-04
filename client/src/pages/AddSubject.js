import { useState } from "react";

export default function AddSubjectForm() {
  const [subject, setSubject] = useState({
    name: "",
    image: "",
    description: "",
  });
  const [lessons, setLessons] = useState([
    { name: "", image: "", description: "" },
  ]);

  const handleSubjectChange = (event) => {
    setSubject({ ...subject, [event.target.name]: event.target.value });
  };

  const handleLessonChange = (index, event) => {
    const updatedLessons = [...lessons];
    updatedLessons[index][event.target.name] = event.target.value;
    setLessons(updatedLessons);
  };

  const addLesson = () => {
    setLessons([...lessons, { name: "", image: "", description: "" }]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = { ...subject, lessons };

    try {
      const res = await fetch("http://localhost:3000/subject/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add subject");
      }

      alert("Subject added successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Add Subject</h2>
      <input
        name="name"
        placeholder="Subject Name"
        value={subject.name}
        onChange={handleSubjectChange}
        className="border p-2 w-full"
        required
      />
      <input
        name="image"
        placeholder="Subject Image URL"
        value={subject.image}
        onChange={handleSubjectChange}
        className="border p-2 w-full"
        required
      />
      <textarea
        name="description"
        placeholder="Subject Description"
        value={subject.description}
        onChange={handleSubjectChange}
        className="border p-2 w-full"
        required
      />

      <h3 className="text-lg font-semibold">Lessons</h3>
      {lessons.map((lesson, index) => (
        <div key={index} className="space-y-2 border p-2 rounded">
          <input
            name="name"
            placeholder="Lesson Name"
            value={lesson.name}
            onChange={(e) => handleLessonChange(index, e)}
            className="border p-2 w-full"
            required
          />
          <input
            name="image"
            placeholder="Lesson Image URL"
            value={lesson.image}
            onChange={(e) => handleLessonChange(index, e)}
            className="border p-2 w-full"
            required
          />
          <textarea
            name="description"
            placeholder="Lesson Description"
            value={lesson.description}
            onChange={(e) => handleLessonChange(index, e)}
            className="border p-2 w-full"
            required
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addLesson}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        + Add Lesson
      </button>
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </form>
  );
}

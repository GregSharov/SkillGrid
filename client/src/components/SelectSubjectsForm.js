import Select from "react-select";

function SelectSubjectsForm({
  animatedComponents,
  subjectSelectOptions,
  selectedSubjects,
  handleSubjectChange,
  selectedLessonsBySubject,
  handleLessonChange,
  handleSave,
  subjectData, // <-- pass this from UserCard
}) {
  return (
    <div className="mt-6 w-full">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Subjects</h3>
      <Select
        closeMenuOnSelect={false}
        components={animatedComponents}
        isMulti
        options={subjectSelectOptions}
        value={selectedSubjects}
        onChange={handleSubjectChange}
        placeholder="Choose subjects..."
        className="rounded-xl shadow-sm"
        classNamePrefix="select"
      />
      {selectedSubjects.map((subject) => {
        const fullSubject = subjectData.find((s) => s._id === subject.value);
        const lessonOptions = (fullSubject?.lessons || []).map((lesson) => ({
          value: lesson._id,
          label: lesson.name,
        }));
        return (
          <div key={subject.value} className="mt-3">
            <h4 className="text-gray-700 font-medium mb-1">
              {subject.label} Lessons
            </h4>
            <Select
              closeMenuOnSelect={false}
              components={animatedComponents}
              isMulti
              options={lessonOptions}
              value={selectedLessonsBySubject[subject.value] || []}
              onChange={(selected) =>
                handleLessonChange(subject.value, selected)
              }
              placeholder="Choose lessons..."
              className="rounded-xl shadow-sm"
              classNamePrefix="select"
            />
          </div>
        );
      })}
      <button
        onClick={handleSave}
        className="mt-6 w-full py-3 bg-blue-600 text-white font-semibold rounded-2xl shadow hover:bg-blue-700 hover:scale-105 transition transform"
      >
        Save Changes
      </button>
    </div>
  );
}

export default SelectSubjectsForm;

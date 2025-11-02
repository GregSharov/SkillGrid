import React, { useState, useEffect } from 'react';
import API_URL from '../services/apiBase';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('teachers');
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [scheduledLessons, setScheduledLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch all data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchTeachers(),
          fetchStudents(),
          fetchSubjects(),
          fetchScheduledLessons()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error loading data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch(`${API_URL}/teachers`);
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_URL}/students`);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API_URL}/subjects`);
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchScheduledLessons = async () => {
    try {
      const response = await fetch(`${API_URL}/schedule/all`);
      const result = await response.json();
      setScheduledLessons(result.data || []);
    } catch (error) {
      console.error('Error fetching scheduled lessons:', error);
    }
  };

  // Image upload handler
  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('file', 'true');

    try {
      const response = await fetch(`${API_URL}/user/upload`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      return result.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Teachers CRUD
  const createTeacher = async (data) => {
    try {
      let imageUrl = data.image;
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      const response = await fetch(`${API_URL}/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, image: imageUrl, isTeacher: true }),
      });
      
      if (response.ok) {
        alert('Teacher created successfully');
        fetchTeachers();
        closeModal();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating teacher:', error);
      alert('Error creating teacher');
    }
  };

  const updateTeacher = async (id, data) => {
    try {
      let imageUrl = data.image;
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      const response = await fetch(`${API_URL}/user/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, image: imageUrl }),
      });
      
      if (response.ok) {
        alert('Teacher updated successfully');
        fetchTeachers();
        closeModal();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating teacher:', error);
      alert('Error updating teacher');
    }
  };

  const deleteTeacher = async (id) => {
    try {
      const response = await fetch(`${API_URL}/user/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        alert('Teacher deleted successfully');
        fetchTeachers();
        setShowDeleteConfirm(false);
      } else {
        alert('Error deleting teacher');
      }
    } catch (error) {
      console.error('Error deleting teacher:', error);
      alert('Error deleting teacher');
    }
  };

  // Students CRUD
  const createStudent = async (data) => {
    try {
      let imageUrl = data.image;
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      const response = await fetch(`${API_URL}/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, image: imageUrl, isTeacher: false }),
      });
      
      if (response.ok) {
        alert('Student created successfully');
        fetchStudents();
        closeModal();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating student:', error);
      alert('Error creating student');
    }
  };

  const updateStudent = async (id, data) => {
    try {
      let imageUrl = data.image;
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      const response = await fetch(`${API_URL}/user/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, image: imageUrl }),
      });
      
      if (response.ok) {
        alert('Student updated successfully');
        fetchStudents();
        closeModal();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Error updating student');
    }
  };

  const deleteStudent = async (id) => {
    try {
      const response = await fetch(`${API_URL}/user/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        alert('Student deleted successfully');
        fetchStudents();
        setShowDeleteConfirm(false);
      } else {
        alert('Error deleting student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Error deleting student');
    }
  };

  // Subjects CRUD
  const createSubject = async (data) => {
    try {
      let imageUrl = data.image;
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      const response = await fetch(`${API_URL}/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, image: imageUrl }),
      });
      
      if (response.ok) {
        alert('Subject created successfully');
        fetchSubjects();
        closeModal();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating subject:', error);
      alert('Error creating subject');
    }
  };

  const updateSubject = async (id, data) => {
    try {
      let imageUrl = data.image;
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      const response = await fetch(`${API_URL}/subjects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, image: imageUrl }),
      });
      
      if (response.ok) {
        alert('Subject updated successfully');
        fetchSubjects();
        closeModal();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating subject:', error);
      alert('Error updating subject');
    }
  };

  const deleteSubject = async (id) => {
    try {
      const response = await fetch(`${API_URL}/subjects/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        alert('Subject deleted successfully');
        fetchSubjects();
        setShowDeleteConfirm(false);
      } else {
        alert('Error deleting subject');
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Error deleting subject');
    }
  };

  // Lessons CRUD (nested in subjects)
  const createLesson = async (subjectId, data) => {
    try {
      let imageUrl = data.image;
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      const response = await fetch(`${API_URL}/subjects/${subjectId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, image: imageUrl }),
      });
      
      if (response.ok) {
        alert('Lesson created successfully');
        fetchSubjects();
        closeModal();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating lesson:', error);
      alert('Error creating lesson');
    }
  };

  const updateLesson = async (subjectId, lessonId, data) => {
    try {
      let imageUrl = data.image;
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      const response = await fetch(`${API_URL}/subjects/${subjectId}/lessons/${lessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, image: imageUrl }),
      });
      
      if (response.ok) {
        alert('Lesson updated successfully');
        fetchSubjects();
        closeModal();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating lesson:', error);
      alert('Error updating lesson');
    }
  };

  const deleteLesson = async (subjectId, lessonId) => {
    try {
      const response = await fetch(`${API_URL}/subjects/${subjectId}/lessons/${lessonId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        alert('Lesson deleted successfully');
        fetchSubjects();
        setShowDeleteConfirm(false);
      } else {
        alert('Error deleting lesson');
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Error deleting lesson');
    }
  };

  // Scheduled Lessons CRUD
  const createScheduledLesson = async (data) => {
    try {
      const response = await fetch(`${API_URL}/schedule/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        alert('Scheduled lesson created successfully');
        fetchScheduledLessons();
        closeModal();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating scheduled lesson:', error);
      alert('Error creating scheduled lesson');
    }
  };

  const updateScheduledLesson = async (id, data) => {
    try {
      const response = await fetch(`${API_URL}/schedule/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        alert('Scheduled lesson updated successfully');
        fetchScheduledLessons();
        closeModal();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating scheduled lesson:', error);
      alert('Error updating scheduled lesson');
    }
  };

  const deleteScheduledLesson = async (id) => {
    try {
      const response = await fetch(`${API_URL}/schedule/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        alert('Scheduled lesson deleted successfully');
        fetchScheduledLessons();
        setShowDeleteConfirm(false);
      } else {
        alert('Error deleting scheduled lesson');
      }
    } catch (error) {
      console.error('Error deleting scheduled lesson:', error);
      alert('Error deleting scheduled lesson');
    }
  };

  // Modal handlers
  const openModal = (type, item = null) => {
    setModalType(type);
    setCurrentItem(item);
    setShowModal(true);
    setImageFile(null);
    setImagePreview(item?.image || null);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setCurrentItem(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const openDeleteConfirm = (type, item) => {
    setItemToDelete({ type, item });
    setShowDeleteConfirm(true);
  };

  const handleDelete = () => {
    const { type, item } = itemToDelete;
    switch (type) {
      case 'teacher':
        deleteTeacher(item._id);
        break;
      case 'student':
        deleteStudent(item._id);
        break;
      case 'subject':
        deleteSubject(item._id);
        break;
      case 'lesson':
        deleteLesson(item.subjectId, item.lessonId);
        break;
      case 'scheduled':
        deleteScheduledLesson(item._id);
        break;
      default:
        break;
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Render functions
  const renderTeachersTab = () => (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b-2 border-slate-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Teachers <span className="text-indigo-600">Management</span>
          </h2>
          <p className="mt-1 text-sm text-slate-600">Manage all teacher accounts and their subjects</p>
        </div>
        <button 
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 active:scale-[0.98] transition"
          onClick={() => openModal('createTeacher')}
        >
          + Add New Teacher
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl shadow-lg ring-1 ring-slate-200">
        <table className="w-full bg-white">
          <thead className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Image</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Birth Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Subjects</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {teachers.map((teacher) => (
              <tr key={teacher._id} className="hover:bg-indigo-50/50 transition">
                <td className="px-4 py-3">
                  <img src={teacher.image} alt={teacher.firstName} className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-200" />
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{teacher.firstName} {teacher.lastName}</td>
                <td className="px-4 py-3 text-slate-600 text-sm">{teacher.email}</td>
                <td className="px-4 py-3 text-slate-600 text-sm">{teacher.phone}</td>
                <td className="px-4 py-3 text-slate-600 text-sm">{new Date(teacher.dateOfBirth).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-slate-600 text-sm">{teacher.subjects?.length || 0} subjects</td>
                <td className="px-4 py-3 text-slate-600 text-sm">
                  <span className="inline-flex items-center gap-1">
                    <span className="text-yellow-500">⭐</span>
                    {teacher.ratingAverage?.toFixed(1) || 'N/A'} ({teacher.ratingCount || 0})
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button 
                      className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-lg hover:bg-emerald-600 transition"
                      onClick={() => openModal('editTeacher', teacher)}
                    >
                      Edit
                    </button>
                    <button 
                      className="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition"
                      onClick={() => openModal('editTeacherSubjects', teacher)}
                    >
                      Subjects
                    </button>
                    <button 
                      className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition"
                      onClick={() => openDeleteConfirm('teacher', teacher)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStudentsTab = () => (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b-2 border-slate-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Students <span className="text-indigo-600">Management</span>
          </h2>
          <p className="mt-1 text-sm text-slate-600">Manage all student accounts and their subjects</p>
        </div>
        <button 
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 active:scale-[0.98] transition"
          onClick={() => openModal('createStudent')}
        >
          + Add New Student
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl shadow-lg ring-1 ring-slate-200">
        <table className="w-full bg-white">
          <thead className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Image</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Birth Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Subjects</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {students.map((student) => (
              <tr key={student._id} className="hover:bg-indigo-50/50 transition">
                <td className="px-4 py-3">
                  <img src={student.image} alt={student.firstName} className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-200" />
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{student.firstName} {student.lastName}</td>
                <td className="px-4 py-3 text-slate-600 text-sm">{student.email}</td>
                <td className="px-4 py-3 text-slate-600 text-sm">{student.phone}</td>
                <td className="px-4 py-3 text-slate-600 text-sm">{new Date(student.dateOfBirth).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-slate-600 text-sm">{student.subjects?.length || 0} subjects</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button 
                      className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-lg hover:bg-emerald-600 transition"
                      onClick={() => openModal('editStudent', student)}
                    >
                      Edit
                    </button>
                    <button 
                      className="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition"
                      onClick={() => openModal('editStudentSubjects', student)}
                    >
                      Subjects
                    </button>
                    <button 
                      className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition"
                      onClick={() => openDeleteConfirm('student', student)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSubjectsTab = () => (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b-2 border-slate-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Subjects & Lessons <span className="text-indigo-600">Management</span>
          </h2>
          <p className="mt-1 text-sm text-slate-600">Manage subjects and their lessons</p>
        </div>
        <button 
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 active:scale-[0.98] transition"
          onClick={() => openModal('createSubject')}
        >
          + Add New Subject
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <div key={subject._id} className="bg-white rounded-2xl shadow-lg ring-1 ring-slate-200 overflow-hidden hover:shadow-xl transition">
            <img src={subject.image} alt={subject.name} className="w-full h-40 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{subject.name}</h3>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{subject.description}</p>
              
              <div className="bg-indigo-50/50 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold text-indigo-900">Lessons ({subject.lessons?.length || 0})</h4>
                  <button 
                    className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition"
                    onClick={() => openModal('createLesson', { subjectId: subject._id })}
                  >
                    + Add
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {subject.lessons?.map((lesson) => (
                    <div key={lesson._id} className="flex items-center gap-3 bg-white rounded-lg p-2 border border-slate-200 hover:border-indigo-300 transition">
                      <img src={lesson.image} alt={lesson.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-medium text-slate-900 truncate">{lesson.name}</h5>
                        <p className="text-xs text-slate-500 truncate">{lesson.description}</p>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          className="text-blue-600 hover:text-blue-700 transition"
                          onClick={() => openModal('editLesson', { ...lesson, subjectId: subject._id })}
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-700 transition"
                          onClick={() => openDeleteConfirm('lesson', { subjectId: subject._id, lessonId: lesson._id })}
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition"
                  onClick={() => openModal('editSubject', subject)}
                >
                  Edit Subject
                </button>
                <button 
                  className="flex-1 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition"
                  onClick={() => openDeleteConfirm('subject', subject)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderScheduledLessonsTab = () => (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b-2 border-slate-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Scheduled Lessons <span className="text-indigo-600">Management</span>
          </h2>
          <p className="mt-1 text-sm text-slate-600">Manage all scheduled lessons and time slots</p>
        </div>
        <button 
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 active:scale-[0.98] transition"
          onClick={() => openModal('createScheduled')}
        >
          + Schedule New Lesson
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl shadow-lg ring-1 ring-slate-200">
        <table className="w-full bg-white">
          <thead className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Teacher</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Student</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Slots</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {scheduledLessons.map((schedule) => (
              <tr key={schedule._id} className="hover:bg-indigo-50/50 transition">
                <td className="px-4 py-3 font-medium text-slate-900">{schedule.teacher?.firstName} {schedule.teacher?.lastName}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{schedule.student?.firstName} {schedule.student?.lastName}</td>
                <td className="px-4 py-3">
                  <div className="space-y-2">
                    {schedule.slots?.map((slot, index) => (
                      <div key={index} className="text-sm bg-indigo-50 rounded-lg p-2 border-l-4 border-indigo-600">
                        <div className="font-semibold text-indigo-900">{slot.lesson?.name}</div>
                        <div className="text-slate-600">{slot.day}, {slot.date} at {slot.time}</div>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button 
                      className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-lg hover:bg-emerald-600 transition"
                      onClick={() => openModal('editScheduled', schedule)}
                    >
                      Edit
                    </button>
                    <button 
                      className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition"
                      onClick={() => openDeleteConfirm('scheduled', schedule)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeModal}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
            <h2 className="text-xl font-bold">{getModalTitle()}</h2>
            <button 
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition"
              onClick={closeModal}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6">
            {renderModalContent()}
          </div>
        </div>
      </div>
    );
  };

  const getModalTitle = () => {
    const titles = {
      createTeacher: 'Create New Teacher',
      editTeacher: 'Edit Teacher',
      editTeacherSubjects: 'Edit Teacher Subjects',
      createStudent: 'Create New Student',
      editStudent: 'Edit Student',
      editStudentSubjects: 'Edit Student Subjects',
      createSubject: 'Create New Subject',
      editSubject: 'Edit Subject',
      createLesson: 'Create New Lesson',
      editLesson: 'Edit Lesson',
      createScheduled: 'Schedule New Lesson',
      editScheduled: 'Edit Scheduled Lesson',
    };
    return titles[modalType] || 'Modal';
  };

  const renderModalContent = () => {
    switch (modalType) {
      case 'createTeacher':
      case 'editTeacher':
        return <UserForm 
          type="teacher" 
          item={currentItem} 
          onSubmit={(data) => currentItem ? updateTeacher(currentItem._id, data) : createTeacher(data)}
          imagePreview={imagePreview}
          onImageChange={handleImageChange}
        />;
      case 'editTeacherSubjects':
        return <UserSubjectsForm 
          user={currentItem} 
          subjects={subjects}
          onSubmit={(data) => updateTeacherSubjects(currentItem._id, data)}
        />;
      case 'createStudent':
      case 'editStudent':
        return <UserForm 
          type="student" 
          item={currentItem} 
          onSubmit={(data) => currentItem ? updateStudent(currentItem._id, data) : createStudent(data)}
          imagePreview={imagePreview}
          onImageChange={handleImageChange}
        />;
      case 'editStudentSubjects':
        return <UserSubjectsForm 
          user={currentItem} 
          subjects={subjects}
          onSubmit={(data) => updateStudentSubjects(currentItem._id, data)}
        />;
      case 'createSubject':
      case 'editSubject':
        return <SubjectForm 
          item={currentItem} 
          onSubmit={(data) => currentItem ? updateSubject(currentItem._id, data) : createSubject(data)}
          imagePreview={imagePreview}
          onImageChange={handleImageChange}
        />;
      case 'createLesson':
      case 'editLesson':
        return <LessonForm 
          item={currentItem} 
          onSubmit={(data) => {
            if (currentItem?._id) {
              updateLesson(currentItem.subjectId, currentItem._id, data);
            } else {
              createLesson(currentItem.subjectId, data);
            }
          }}
          imagePreview={imagePreview}
          onImageChange={handleImageChange}
        />;
      case 'createScheduled':
      case 'editScheduled':
        return <ScheduledLessonForm 
          item={currentItem}
          teachers={teachers}
          students={students}
          subjects={subjects}
          onSubmit={(data) => currentItem ? updateScheduledLesson(currentItem._id, data) : createScheduledLesson(data)}
        />;
      default:
        return null;
    }
  };

  const updateTeacherSubjects = async (id, data) => {
    try {
      const response = await fetch(`${API_URL}/user/${id}/subjects`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        alert('Teacher subjects updated successfully');
        fetchTeachers();
        closeModal();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating teacher subjects:', error);
      alert('Error updating teacher subjects');
    }
  };

  const updateStudentSubjects = async (id, data) => {
    try {
      const response = await fetch(`${API_URL}/user/${id}/subjects`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        alert('Student subjects updated successfully');
        fetchStudents();
        closeModal();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating student subjects:', error);
      alert('Error updating student subjects');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50/40 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg font-semibold text-slate-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50/40">
      {/* Top gradient hairline */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-400 via-sky-400 to-indigo-500" />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-indigo-100">Manage your platform with full CRUD control</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-4">
            <button 
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition ${
                activeTab === 'teachers' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-slate-700 hover:bg-slate-100 ring-1 ring-slate-200'
              }`}
              onClick={() => setActiveTab('teachers')}
            >
              Teachers ({teachers.length})
            </button>
            <button 
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition ${
                activeTab === 'students' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-slate-700 hover:bg-slate-100 ring-1 ring-slate-200'
              }`}
              onClick={() => setActiveTab('students')}
            >
              Students ({students.length})
            </button>
            <button 
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition ${
                activeTab === 'subjects' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-slate-700 hover:bg-slate-100 ring-1 ring-slate-200'
              }`}
              onClick={() => setActiveTab('subjects')}
            >
              Subjects ({subjects.length})
            </button>
            <button 
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition ${
                activeTab === 'scheduled' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-slate-700 hover:bg-slate-100 ring-1 ring-slate-200'
              }`}
              onClick={() => setActiveTab('scheduled')}
            >
              Scheduled ({scheduledLessons.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-lg ring-1 ring-slate-200 p-6 sm:p-8">
          {activeTab === 'teachers' && renderTeachersTab()}
          {activeTab === 'students' && renderStudentsTab()}
          {activeTab === 'subjects' && renderSubjectsTab()}
          {activeTab === 'scheduled' && renderScheduledLessonsTab()}
        </div>
      </div>

      {renderModal()}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-bold text-center text-slate-900">Confirm Delete</h2>
              <p className="mt-2 text-center text-slate-600">
                Are you sure you want to delete this item? This action cannot be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button 
                  className="flex-1 px-4 py-2.5 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button 
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// User Form Component
const UserForm = ({ type, item, onSubmit, imagePreview, onImageChange }) => {
  const [formData, setFormData] = useState({
    firstName: item?.firstName || '',
    lastName: item?.lastName || '',
    email: item?.email || '',
    phone: item?.phone || '',
    dateOfBirth: item?.dateOfBirth ? new Date(item.dateOfBirth).toISOString().split('T')[0] : '',
    password: '',
    image: item?.image || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!item && !formData.password) {
      alert('Password is required for new users');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">First Name *</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
          className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Last Name *</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
          className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Email *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Phone *</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Date of Birth *</label>
        <input
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          required
          className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Password {item ? '(leave empty to keep current)' : '*'}
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required={!item}
          className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Profile Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {imagePreview && (
          <img src={imagePreview} alt="Preview" className="mt-3 w-32 h-32 rounded-xl object-cover ring-2 ring-indigo-200" />
        )}
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-200">
        <button 
          type="submit" 
          className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md active:scale-[0.98] transition"
        >
          {item ? 'Update' : 'Create'} {type === 'teacher' ? 'Teacher' : 'Student'}
        </button>
      </div>
    </form>
  );
};

// User Subjects Form Component
const UserSubjectsForm = ({ user, subjects, onSubmit }) => {
  const [selectedSubjects, setSelectedSubjects] = useState(
    user.subjects?.map(s => s._id) || []
  );
  const [selectedLessons, setSelectedLessons] = useState(
    user.subjects?.reduce((acc, subj) => {
      acc[subj._id] = subj.lessons?.map(l => l._id) || [];
      return acc;
    }, {}) || {}
  );

  const handleSubjectToggle = (subjectId) => {
    if (selectedSubjects.includes(subjectId)) {
      setSelectedSubjects(selectedSubjects.filter(id => id !== subjectId));
      const newLessons = { ...selectedLessons };
      delete newLessons[subjectId];
      setSelectedLessons(newLessons);
    } else {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    }
  };

  const handleLessonToggle = (subjectId, lessonId) => {
    const currentLessons = selectedLessons[subjectId] || [];
    if (currentLessons.includes(lessonId)) {
      setSelectedLessons({
        ...selectedLessons,
        [subjectId]: currentLessons.filter(id => id !== lessonId)
      });
    } else {
      setSelectedLessons({
        ...selectedLessons,
        [subjectId]: [...currentLessons, lessonId]
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formattedData = {
      subjects: selectedSubjects.map(id => ({ value: id })),
      lessons: selectedSubjects.reduce((acc, subjId) => {
        acc[subjId] = (selectedLessons[subjId] || []).map(lessonId => ({ value: lessonId }));
        return acc;
      }, {})
    };
    
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      {subjects.map((subject) => (
        <div key={subject._id} className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200 hover:border-indigo-300 transition">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedSubjects.includes(subject._id)}
              onChange={() => handleSubjectToggle(subject._id)}
              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
            />
            <span className="font-semibold text-slate-900">{subject.name}</span>
          </label>
          
          {selectedSubjects.includes(subject._id) && subject.lessons?.length > 0 && (
            <div className="mt-3 ml-8 space-y-2 bg-white rounded-lg p-3 border border-slate-200">
              <p className="text-xs font-semibold text-indigo-900 uppercase tracking-wide">Select Lessons:</p>
              {subject.lessons.map((lesson) => (
                <label key={lesson._id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(selectedLessons[subject._id] || []).includes(lesson._id)}
                    onChange={() => handleLessonToggle(subject._id, lesson._id)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-slate-700">{lesson.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
      <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-200 sticky bottom-0 bg-white">
        <button 
          type="submit" 
          className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md active:scale-[0.98] transition"
        >
          Update Subjects & Lessons
        </button>
      </div>
    </form>
  );
};

// Subject Form Component
const SubjectForm = ({ item, onSubmit, imagePreview, onImageChange }) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    image: item?.image || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Subject Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          required
          className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Subject Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {imagePreview && (
          <img src={imagePreview} alt="Preview" className="mt-3 w-full h-40 rounded-xl object-cover ring-2 ring-indigo-200" />
        )}
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-200">
        <button 
          type="submit" 
          className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md active:scale-[0.98] transition"
        >
          {item ? 'Update' : 'Create'} Subject
        </button>
      </div>
    </form>
  );
};

// Lesson Form Component
const LessonForm = ({ item, onSubmit, imagePreview, onImageChange }) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    image: item?.image || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Lesson Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          required
          className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Lesson Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {imagePreview && (
          <img src={imagePreview} alt="Preview" className="mt-3 w-full h-40 rounded-xl object-cover ring-2 ring-indigo-200" />
        )}
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-200">
        <button 
          type="submit" 
          className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md active:scale-[0.98] transition"
        >
          {item?._id ? 'Update' : 'Create'} Lesson
        </button>
      </div>
    </form>
  );
};

// Scheduled Lesson Form Component
const ScheduledLessonForm = ({ item, teachers, students, subjects, onSubmit }) => {
  const [formData, setFormData] = useState({
    teacherId: item?.teacher?._id || '',
    studentId: item?.student?._id || '',
    slots: item?.slots || [{ time: '', date: '', day: '', lessonId: '', subjectId: '' }],
  });

  const handleTeacherChange = (e) => {
    setFormData({ ...formData, teacherId: e.target.value });
  };

  const handleStudentChange = (e) => {
    setFormData({ ...formData, studentId: e.target.value });
  };

  const handleSlotChange = (index, field, value) => {
    const newSlots = [...formData.slots];
    newSlots[index][field] = value;
    
    if (field === 'date') {
      const date = new Date(value);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      newSlots[index].day = days[date.getDay()];
    }
    
    setFormData({ ...formData, slots: newSlots });
  };

  const addSlot = () => {
    setFormData({
      ...formData,
      slots: [...formData.slots, { time: '', date: '', day: '', lessonId: '', subjectId: '' }]
    });
  };

  const removeSlot = (index) => {
    const newSlots = formData.slots.filter((_, i) => i !== index);
    setFormData({ ...formData, slots: newSlots });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const teacher = teachers.find(t => t._id === formData.teacherId);
    const student = students.find(s => s._id === formData.studentId);
    
    if (!teacher || !student) {
      alert('Please select both teacher and student');
      return;
    }

    const formattedData = {
      teacher: {
        _id: teacher._id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
      },
      student: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
      },
      slots: formData.slots.map(slot => {
        const subject = subjects.find(s => s._id === slot.subjectId);
        const lesson = subject?.lessons?.find(l => l._id === slot.lessonId);
        
        return {
          time: slot.time,
          date: slot.date,
          day: slot.day,
          lesson: lesson ? {
            _id: lesson._id,
            name: lesson.name,
            description: lesson.description,
          } : {}
        };
      })
    };
    
    onSubmit(formattedData);
  };

  const getAvailableLessons = (subjectId) => {
    const subject = subjects.find(s => s._id === subjectId);
    return subject?.lessons || [];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Teacher *</label>
        <select
          value={formData.teacherId}
          onChange={handleTeacherChange}
          required
          className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
        >
          <option value="">Select a teacher</option>
          {teachers.map((teacher) => (
            <option key={teacher._id} value={teacher._id}>
              {teacher.firstName} {teacher.lastName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Student *</label>
        <select
          value={formData.studentId}
          onChange={handleStudentChange}
          required
          className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
        >
          <option value="">Select a student</option>
          {students.map((student) => (
            <option key={student._id} value={student._id}>
              {student.firstName} {student.lastName}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-indigo-50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-indigo-900">Lesson Slots</h3>
          <button 
            type="button" 
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
            onClick={addSlot}
          >
            + Add Slot
          </button>
        </div>
        
        <div className="space-y-4">
          {formData.slots.map((slot, index) => (
            <div key={index} className="bg-white rounded-xl p-4 border-2 border-slate-200">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-slate-900">Slot {index + 1}</h4>
                {formData.slots.length > 1 && (
                  <button 
                    type="button" 
                    className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition"
                    onClick={() => removeSlot(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={slot.subjectId}
                    onChange={(e) => handleSlotChange(index, 'subjectId', e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border-2 border-slate-300 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                  >
                    <option value="">Select subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lesson *</label>
                  <select
                    value={slot.lessonId}
                    onChange={(e) => handleSlotChange(index, 'lessonId', e.target.value)}
                    required
                    disabled={!slot.subjectId}
                    className="w-full px-3 py-2 rounded-lg border-2 border-slate-300 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition disabled:bg-slate-100"
                  >
                    <option value="">Select lesson</option>
                    {getAvailableLessons(slot.subjectId).map((lesson) => (
                      <option key={lesson._id} value={lesson._id}>
                        {lesson.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={slot.date}
                    onChange={(e) => handleSlotChange(index, 'date', e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border-2 border-slate-300 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time *</label>
                  <input
                    type="time"
                    value={slot.time}
                    onChange={(e) => handleSlotChange(index, 'time', e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border-2 border-slate-300 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Day</label>
                  <input
                    type="text"
                    value={slot.day}
                    readOnly
                    placeholder="Auto-calculated from date"
                    className="w-full px-3 py-2 rounded-lg border-2 border-slate-300 text-sm bg-slate-50 text-slate-600"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-200 sticky bottom-0 bg-white">
        <button 
          type="submit" 
          className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md active:scale-[0.98] transition"
        >
          {item ? 'Update' : 'Create'} Scheduled Lesson
        </button>
      </div>
    </form>
  );
};

export default AdminDashboard;

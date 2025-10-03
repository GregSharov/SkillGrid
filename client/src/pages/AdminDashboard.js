import { useEffect, useState } from "react";
import API_URL from "../services/apiBase";
import fetchData from "../services/fetchData";
import useUploadImage from "../services/uploadImage";

// Import icons (you may need to install react-icons)
import {
  FiUsers,
  FiBookOpen,
  FiCalendar,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiImage,
  FiSave,
  FiX
} from "react-icons/fi";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("teachers");
  const [teachersData, setTeachersData] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  const [subjectsData, setSubjectsData] = useState([]);
  const [scheduledLessonsData, setScheduledLessonsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonFormData, setLessonFormData] = useState({});
  const { uploadImage, loading: uploadLoading } = useUploadImage();
  const defaultUserImage = `https://res.cloudinary.com/de3jgizbm/image/upload/v1759523927/user_mtgtft.png`;

  // Direct upload function for new items
  const uploadImageDirectly = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("directUpload", "true"); // Flag to indicate direct upload

    const response = await fetch(`${API_URL}/user/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to upload image");
    }

    return await response.json();
  };

  const tabs = [
    { id: "teachers", label: "Teachers", icon: FiUsers },
    { id: "students", label: "Students", icon: FiUsers },
    { id: "subjects", label: "Subjects", icon: FiBookOpen },
    { id: "scheduled", label: "Scheduled Lessons", icon: FiCalendar },
  ];

  // Load data based on active tab
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case "teachers":
          const teachers = await fetchData("teachers");
          setTeachersData(teachers);
          break;
        case "students":
          const students = await fetchData("students");
          setStudentsData(students);
          break;
        case "subjects":
          const subjects = await fetchData("subjects");
          setSubjectsData(subjects);
          break;
        case "scheduled":
          const scheduled = await fetch(`${API_URL}/schedule/user/all`, {
            credentials: "include",
          });
          const scheduledData = await scheduled.json();
          setScheduledLessonsData(scheduledData.data || []);
          break;
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData(getDefaultFormData());
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    // Format date for input field (convert ISO to YYYY-MM-DD)
    const formattedItem = {
      ...item,
      dateOfBirth: item.dateOfBirth ? new Date(item.dateOfBirth).toISOString().split('T')[0] : ''
    };
    setFormData(formattedItem);
    setShowModal(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${activeTab}/${item._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        loadData();
        alert(`${activeTab.slice(0, -1)} deleted successfully!`);
      } else {
        alert("Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Error deleting item");
    }
  };

  const handleSave = async () => {
    try {
      const url = editingItem
        ? `${API_URL}/${activeTab}/${editingItem._id}`
        : `${API_URL}/${activeTab}`;

      const method = editingItem ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        loadData();
        alert(`${activeTab.slice(0, -1)} ${editingItem ? 'updated' : 'created'} successfully!`);
      } else {
        alert(`Failed to ${editingItem ? 'update' : 'create'} item`);
      }
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Error saving item");
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    try {
      let result;
      
      if (editingItem?._id) {
        // For existing items, use the upload service
        console.log('Uploading image for existing user ID:', editingItem._id);
        result = await uploadImage(editingItem._id, file);
      } else {
        // For new items, upload directly to Cloudinary without user association
        result = await uploadImageDirectly(file);
      }
      
      console.log('Upload result:', result);
      
      if (result?.imageUrl || result?.secure_url) {
        const imageUrl = result.imageUrl || result.secure_url;
        setFormData(prev => ({ ...prev, image: imageUrl }));
        setShowImageUpload(false);
        alert("Image uploaded successfully!");
      } else {
        console.error('No image URL in result:', result);
        alert("Upload failed: No image URL received");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(`Error uploading image: ${error.message}`);
    }
  };

  const handleEditLesson = (lesson, index) => {
    setEditingLesson({ lesson, index });
    setLessonFormData(lesson);
    setShowLessonModal(true);
  };

  const handleDeleteLesson = (index) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) {
      return;
    }

    const updatedLessons = [...(formData.lessons || [])];
    updatedLessons.splice(index, 1);
    setFormData({ ...formData, lessons: updatedLessons });
  };

  const handleSaveLesson = () => {
    const updatedLessons = [...(formData.lessons || [])];

    if (editingLesson) {
      // Update existing lesson
      updatedLessons[editingLesson.index] = lessonFormData;
    } else {
      // Add new lesson
      updatedLessons.push({
        ...lessonFormData,
        _id: Date.now().toString() // Temporary ID for new lessons
      });
    }

    setFormData({ ...formData, lessons: updatedLessons });
    setShowLessonModal(false);
    setEditingLesson(null);
    setLessonFormData({});
  };

  const handleLessonImageUpload = async (file) => {
    if (!file) return;

    try {
      // For lessons, always use direct upload since they're not associated with users
      const result = await uploadImageDirectly(file);
      
      if (result?.imageUrl) {
        setLessonFormData(prev => ({ ...prev, image: result.imageUrl }));
        alert("Lesson image uploaded successfully!");
      } else {
        alert("Upload failed: No image URL received");
      }
    } catch (error) {
      console.error("Error uploading lesson image:", error);
      alert(`Error uploading lesson image: ${error.message}`);
    }
  };

  const getDefaultFormData = () => {
    switch (activeTab) {
      case "teachers":
      case "students":
        return {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          dateOfBirth: "",
          password: "",
          image: defaultUserImage,
          subjects: [],
          isTeacher: activeTab === "teachers"
        };
      case "subjects":
        return {
          name: "",
          description: "",
          image: "https://res.cloudinary.com/de3jgizbm/image/upload/v1759523927/subjects/default_subject.png",
          lessons: []
        };
      case "scheduled":
        return {
          teacher: { _id: "", firstName: "", lastName: "" },
          student: { _id: "", firstName: "", lastName: "" },
          slots: [],
          peers: []
        };
      default:
        return {};
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case "teachers": return teachersData;
      case "students": return studentsData;
      case "subjects": return subjectsData;
      case "scheduled": return scheduledLessonsData;
      default: return [];
    }
  };

  const renderTable = () => {
    const data = getCurrentData();

    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No {activeTab} found</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-50">
            <tr>
              {activeTab === "teachers" || activeTab === "students" ? (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </>
              ) : activeTab === "subjects" ? (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lessons</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slots</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                {activeTab === "teachers" || activeTab === "students" ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={item.image || defaultUserImage}
                        alt={`${item.firstName} ${item.lastName}`}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.firstName} {item.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </>
                ) : activeTab === "subjects" ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.lessons?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.teacher?.firstName} {item.teacher?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.student?.firstName} {item.student?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.slots?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDelete(item)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {editingItem ? 'Edit' : 'Create'} {activeTab.slice(0, -1)}
            </h2>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="space-y-4">
            {activeTab === "teachers" || activeTab === "students" ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName || ""}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName || ""}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth || ""}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password || ""}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profile Image
                    </label>
                    <button
                      onClick={() => setShowImageUpload(true)}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <FiImage size={16} />
                      <span>Upload Image</span>
                    </button>
                  </div>
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="h-16 w-16 rounded object-cover"
                    />
                  )}
                </div>
              </>
            ) : activeTab === "subjects" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject Image
                    </label>
                    <button
                      onClick={() => setShowImageUpload(true)}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <FiImage size={16} />
                      <span>Upload Image</span>
                    </button>
                  </div>
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="h-16 w-16 rounded object-cover"
                    />
                  )}
                </div>

                {/* Lessons Management */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Lessons</h3>
                    <button
                      onClick={() => setShowLessonModal(true)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center space-x-1"
                    >
                      <FiPlus size={14} />
                      <span>Add Lesson</span>
                    </button>
                  </div>

                  {formData.lessons && formData.lessons.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {formData.lessons.map((lesson, index) => (
                        <div key={lesson._id || index} className="flex items-center justify-between p-2 border rounded bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <img
                              src={lesson.image}
                              alt={lesson.name}
                              className="h-8 w-8 rounded object-cover"
                            />
                            <div>
                              <p className="font-medium text-sm">{lesson.name}</p>
                              <p className="text-xs text-gray-500 truncate max-w-xs">{lesson.description}</p>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditLesson(lesson, index)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                            >
                              <FiEdit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(index)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <FiTrash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No lessons added yet</p>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teacher
                    </label>
                    <select
                      value={formData.teacher?._id || ""}
                      onChange={(e) => {
                        const selectedTeacher = teachersData.find(t => t._id === e.target.value);
                        setFormData({
                          ...formData,
                          teacher: selectedTeacher ? {
                            _id: selectedTeacher._id,
                            firstName: selectedTeacher.firstName,
                            lastName: selectedTeacher.lastName
                          } : { _id: "", firstName: "", lastName: "" }
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Teacher</option>
                      {teachersData.map(teacher => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.firstName} {teacher.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student
                    </label>
                    <select
                      value={formData.student?._id || ""}
                      onChange={(e) => {
                        const selectedStudent = studentsData.find(s => s._id === e.target.value);
                        setFormData({
                          ...formData,
                          student: selectedStudent ? {
                            _id: selectedStudent._id,
                            firstName: selectedStudent.firstName,
                            lastName: selectedStudent.lastName
                          } : { _id: "", firstName: "", lastName: "" }
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Student</option>
                      {studentsData.map(student => (
                        <option key={student._id} value={student._id}>
                          {student.firstName} {student.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Slots
                  </label>
                  <div className="border rounded p-4 bg-gray-50">
                    <p className="text-gray-500 text-sm">
                      Slot management would be implemented here for creating/editing scheduled lessons
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      This would include date, time, day selection and lesson assignment
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <FiSave size={16} />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderImageUploadModal = () => {
    if (!showImageUpload) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Upload Image</h3>
            <button
              onClick={() => setShowImageUpload(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleImageUpload(file);
                  // Reset the input value so the same file can be selected again if needed
                  e.target.value = '';
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {uploadLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2">Uploading...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderLessonModal = () => {
    if (!showLessonModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">
              {editingLesson ? 'Edit' : 'Add'} Lesson
            </h3>
            <button
              onClick={() => {
                setShowLessonModal(false);
                setEditingLesson(null);
                setLessonFormData({});
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lesson Name
              </label>
              <input
                type="text"
                value={lessonFormData.name || ""}
                onChange={(e) => setLessonFormData({ ...lessonFormData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={lessonFormData.description || ""}
                onChange={(e) => setLessonFormData({ ...lessonFormData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleLessonImageUpload(file);
                      // Reset the input value so the same file can be selected again if needed
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {lessonFormData.image && (
                <img
                  src={lessonFormData.image}
                  alt="Preview"
                  className="h-12 w-12 rounded object-cover ml-4"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowLessonModal(false);
                setEditingLesson(null);
                setLessonFormData({});
              }}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveLesson}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
            >
              <FiSave size={16} />
              <span>Save Lesson</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage all system data and users</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mb-6 flex justify-between items-center">
          <div className="text-lg font-semibold text-gray-900 capitalize">
            {activeTab} Management
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
          >
            <FiPlus size={18} />
            <span>Add {activeTab.slice(0, -1)}</span>
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow">
          {renderTable()}
        </div>

        {/* Modals */}
        {renderModal()}
        {renderImageUploadModal()}
        {renderLessonModal()}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import axios from "axios";

const EnrollStudentModal = ({ isOpen, onClose, courseId, onEnrollSuccess }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchAvailableStudents();
    }
  }, [isOpen]);

  const fetchAvailableStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/users/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to load students");
    }
  };

  const handleEnroll = async () => {
    if (!selectedStudent) {
      setError("Please select a student");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:8000/courses/${courseId}/enroll/${selectedStudent}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      onEnrollSuccess();
      onClose();
      setSelectedStudent("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to enroll student");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Enroll Student</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Search Students
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Select Student
          </label>
          <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg">
            {filteredStudents.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No students found
              </div>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student.id)}
                  className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                    selectedStudent === student.id
                      ? "bg-blue-50 border-l-4 border-blue-500"
                      : ""
                  }`}
                >
                  <div className="font-medium text-gray-800">
                    {student.full_name}
                  </div>
                  <div className="text-sm text-gray-600">{student.email}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleEnroll}
            disabled={loading || !selectedStudent}
            className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200 font-medium disabled:bg-blue-300"
          >
            {loading ? "Enrolling..." : "Enroll Student"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition duration-200 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrollStudentModal;

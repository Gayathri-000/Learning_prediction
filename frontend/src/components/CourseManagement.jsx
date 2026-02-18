import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { courseService } from "../services/api";
import Navbar from "./Navbar";
import EnrollStudentModal from "./EnrollStudentModal";
import ConfirmDialog from "./ConfirmDialog";

const CourseManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    studentId: null,
    studentName: "",
  });
  const [unenrolling, setUnenrolling] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const courseResponse = await courseService.getCourse(courseId);
      setCourse(courseResponse.data);

      const studentsResponse = await courseService.getCourseStudents(courseId);
      setStudents(studentsResponse.data);
    } catch (error) {
      console.error("Error fetching course data:", error);
      setError("Failed to load course data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudent = (enrollmentId) => {
    navigate(`/teacher/enrollment/${enrollmentId}`);
  };

  const handleEnrollSuccess = () => {
    setSuccess("Student enrolled successfully!");
    setTimeout(() => setSuccess(""), 3000);
    fetchCourseData();
  };

  const handleUnenrollClick = (student) => {
    setConfirmDialog({
      isOpen: true,
      studentId: student.id,
      studentName: student.full_name,
    });
  };

  const handleUnenrollConfirm = async () => {
    setUnenrolling(true);
    setError("");

    try {
      const response = await courseService.unenrollStudent(
        courseId,
        confirmDialog.studentId,
      );

      setSuccess(response.data.message || "Student unenrolled successfully!");
      setTimeout(() => setSuccess(""), 3000);

      // Refresh student list
      await fetchCourseData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to unenroll student");
    } finally {
      setUnenrolling(false);
      setConfirmDialog({ isOpen: false, studentId: null, studentName: "" });
    }
  };

  const handleUnenrollCancel = () => {
    setConfirmDialog({ isOpen: false, studentId: null, studentName: "" });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading course data...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate("/dashboard")}
            className="mb-6 text-blue-500 hover:text-blue-700 font-medium flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </button>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {course?.title}
            </h1>
            <p className="text-gray-600">{course?.description}</p>
            <p className="text-sm text-gray-500 mt-4">
              Created:{" "}
              {course && new Date(course.created_at).toLocaleDateString()}
            </p>

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => navigate(`/course/${courseId}/qa`)}
                className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition duration-200 font-medium flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                View Q&A Board
              </button>

              <button
                onClick={() => navigate(`/teacher/course/${courseId}/videos`)}
                className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition duration-200 font-medium flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Manage Videos
              </button>

              {/* Resource Button */}
              <button
                onClick={() => navigate(`/course/${courseId}/resources`)}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition duration-200 font-medium flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Resources
              </button>

              {/* NEW: Manage Tests Button */}
              <button
                onClick={() => navigate(`/teacher/course/${courseId}/tests`)}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-200 font-medium flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Manage Tests
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Enrolled Students ({students.length})
              </h2>
              <button
                onClick={() => setShowEnrollModal(true)}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition duration-200 font-medium flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Enroll Student
              </button>
            </div>

            {students.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <p className="text-gray-600 text-lg mb-2">
                  No students enrolled yet.
                </p>
                <p className="text-gray-500">
                  Click "Enroll Student" to add students to this course.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr
                        key={student.id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="py-3 px-4 text-gray-800">
                          {student.full_name}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {student.email}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                handleViewStudent(student.enrollment_id)
                              }
                              className="text-blue-500 hover:text-blue-700 font-medium flex items-center"
                            >
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              Manage
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => handleUnenrollClick(student)}
                              className="text-red-500 hover:text-red-700 font-medium flex items-center"
                              disabled={unenrolling}
                            >
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Unenroll
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <EnrollStudentModal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        courseId={courseId}
        onEnrollSuccess={handleEnrollSuccess}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Confirm Unenrollment"
        message={`Are you sure you want to unenroll "${confirmDialog.studentName}" from this course? This will delete all their enrollment data, predictions, and recommendations. This action cannot be undone.`}
        onConfirm={handleUnenrollConfirm}
        onCancel={handleUnenrollCancel}
        confirmText="Yes, Unenroll"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

export default CourseManagement;

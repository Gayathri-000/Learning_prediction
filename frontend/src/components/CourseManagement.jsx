import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { courseService } from "../services/api";
import Navbar from "./Navbar";
import EnrollStudentModal from "./EnrollStudentModal";

const CourseManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEnrollModal, setShowEnrollModal] = useState(false);

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
    // Refresh the student list after successful enrollment
    fetchCourseData();
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

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {course?.title}
            </h1>
            <p className="text-gray-600">{course?.description}</p>
            <p className="text-sm text-gray-500 mt-4">
              Created:{" "}
              {course && new Date(course.created_at).toLocaleDateString()}
            </p>
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
                          <button
                            onClick={() =>
                              handleViewStudent(student.enrollment_id)
                            }
                            className="text-blue-500 hover:text-blue-700 font-medium flex items-center"
                          >
                            Manage
                            <svg
                              className="w-4 h-4 ml-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
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
    </>
  );
};

export default CourseManagement;

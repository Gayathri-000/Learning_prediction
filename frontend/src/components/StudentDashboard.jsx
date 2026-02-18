import React, { useState, useEffect } from "react";
import { studentService, courseService } from "../services/api";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const StudentDashboard = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await studentService.getEnrollments();
      const enrollmentsWithCourses = await Promise.all(
        response.data.map(async (enrollment) => {
          const courseResponse = await courseService.getCourse(
            enrollment.course_id,
          );
          return {
            ...enrollment,
            course: courseResponse.data,
          };
        }),
      );
      setEnrollments(enrollmentsWithCourses);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (enrollmentId) => {
    navigate(`/enrollment/${enrollmentId}`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your courses...</p>
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
          <h1 className="text-3xl font-bold text-gray-800 mb-8">My Courses</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {enrollments.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-600 text-lg">
                You are not enrolled in any courses yet.
              </p>
              <p className="text-gray-500 mt-2">
                Contact your teacher to get enrolled.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {enrollment.course.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {enrollment.course.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Progress:</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${enrollment.course_progress}%`,
                              }}
                            ></div>
                          </div>
                          <span className="font-semibold text-sm">
                            {enrollment.course_progress}%
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">
                          Avg Score:
                        </span>
                        <span className="font-semibold text-sm">
                          {enrollment.avg_assignment_score.toFixed(1)}
                        </span>
                      </div>

                      {enrollment.predicted_outcome && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm">
                            Prediction:
                          </span>
                          <span
                            className={`font-semibold text-sm ${
                              enrollment.predicted_outcome === "Pass"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {enrollment.predicted_outcome} (
                            {(enrollment.prediction_probability * 100).toFixed(
                              1,
                            )}
                            %)
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleViewDetails(enrollment.id)}
                      className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200 font-medium"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/course/${enrollment.course_id}/qa`)
                      }
                      className="w-full mt-2 bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition duration-200 font-medium flex items-center justify-center"
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
                      Q&A
                    </button>

                    <button
                      onClick={() =>
                        navigate(
                          `/student/course/${enrollment.course_id}/videos`,
                        )
                      }
                      className="w-full mt-2 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition duration-200 font-medium flex items-center justify-center"
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
                      Videos
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/course/${enrollment.course_id}/resources`)
                      }
                      className="w-full mt-2 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition duration-200 font-medium flex items-center justify-center"
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

                    <button
                      onClick={() =>
                        navigate(
                          `/student/course/${enrollment.course_id}/tests`,
                        )
                      }
                      className="w-full mt-2 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition duration-200 font-medium flex items-center justify-center"
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
                      View Tests
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;

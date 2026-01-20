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
            enrollment.course_id
          );
          return {
            ...enrollment,
            course: courseResponse.data,
          };
        })
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
                              1
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

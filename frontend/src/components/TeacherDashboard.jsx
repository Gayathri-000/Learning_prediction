import React, { useState, useEffect } from "react";
import { courseService } from "../services/api";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", description: "" });
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await courseService.getCourses();
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setError("");
    setCreating(true);

    try {
      await courseService.createCourse(newCourse);
      setNewCourse({ title: "", description: "" });
      setShowCreateForm(false);
      await fetchCourses();
    } catch (error) {
      console.error("Error creating course:", error);
      setError("Failed to create course. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleViewCourse = (courseId) => {
    navigate(`/teacher/course/${courseId}/manage`);
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">My Courses</h1>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-200 font-medium"
            >
              {showCreateForm ? "Cancel" : "+ Create Course"}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {showCreateForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Create New Course</h2>
              <form onSubmit={handleCreateCourse}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Course Title
                  </label>
                  <input
                    type="text"
                    value={newCourse.title}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Introduction to Machine Learning"
                    required
                    disabled={creating}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={newCourse.description}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Brief description of the course..."
                    required
                    disabled={creating}
                  />
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition duration-200 font-medium disabled:bg-green-300"
                >
                  {creating ? "Creating..." : "Create Course"}
                </button>
              </form>
            </div>
          )}

          {courses.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-600 text-lg">
                You haven't created any courses yet.
              </p>
              <p className="text-gray-500 mt-2">
                Click "Create Course" to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {course.description}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Created:{" "}
                      {new Date(course.created_at).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => handleViewCourse(course.id)}
                      className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200 font-medium"
                    >
                      Manage Course
                    </button>

                    <button
                      onClick={() => navigate(`/course/${course.id}/resources`)}
                      className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition duration-200 font-medium flex items-center justify-center"
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
                      Manage Resources
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/teacher/course/${course.id}/tests`)
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
                      Manage Tests
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

export default TeacherDashboard;

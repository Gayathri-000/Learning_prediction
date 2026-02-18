import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { testService, courseService } from "../services/api";
import Navbar from "./Navbar";
import ConfirmDialog from "./ConfirmDialog";

const TestManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    testId: null,
    testTitle: "",
  });

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      const [courseResponse, testsResponse] = await Promise.all([
        courseService.getCourse(courseId),
        testService.getCourseTests(courseId),
      ]);
      setCourse(courseResponse.data);
      setTests(testsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load tests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async () => {
    try {
      await testService.deleteTest(confirmDialog.testId);
      setSuccess("Test deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete test");
    } finally {
      setConfirmDialog({ isOpen: false, testId: null, testTitle: "" });
    }
  };

  const handleToggleActive = async (testId, currentStatus) => {
    try {
      await testService.updateTest(testId, { is_active: !currentStatus });
      setSuccess(
        `Test ${!currentStatus ? "activated" : "deactivated"} successfully!`,
      );
      setTimeout(() => setSuccess(""), 3000);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update test");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tests...</p>
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
            onClick={() => navigate(-1)}
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
            Back
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

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {course?.title}
                </h1>
                <p className="text-gray-600 mt-2">Test Management</p>
              </div>
              <button
                onClick={() =>
                  navigate(`/teacher/course/${courseId}/test/create`)
                }
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Create Test
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {tests.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-600 text-lg">No tests created yet.</p>
                <p className="text-gray-500 mt-2">
                  Click "Create Test" to add your first test.
                </p>
              </div>
            ) : (
              tests.map((test) => (
                <div
                  key={test.id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {test.title}
                        </h3>
                        <span
                          className={`ml-3 px-3 py-1 text-sm font-medium rounded-full ${
                            test.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {test.is_active ? "✓ Active" : "✗ Inactive"}
                        </span>
                      </div>
                      {test.description && (
                        <p className="text-gray-600 mb-3">{test.description}</p>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Total Marks:</span>{" "}
                          {test.total_marks}
                        </div>
                        <div>
                          <span className="font-medium">Passing Marks:</span>{" "}
                          {test.passing_marks}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span>{" "}
                          {test.duration_minutes} min
                        </div>
                        <div>
                          <span className="font-medium">Questions:</span>{" "}
                          {test.questions?.length || 0}
                        </div>
                      </div>
                      {(test.start_time || test.end_time) && (
                        <div className="mt-3 text-sm text-gray-600">
                          {test.start_time && (
                            <div>
                              <span className="font-medium">Start:</span>{" "}
                              {new Date(test.start_time).toLocaleString()}
                            </div>
                          )}
                          {test.end_time && (
                            <div>
                              <span className="font-medium">End:</span>{" "}
                              {new Date(test.end_time).toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() =>
                          navigate(`/teacher/test/${test.id}/submissions`)
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Submissions
                      </button>
                      <button
                        onClick={() =>
                          handleToggleActive(test.id, test.is_active)
                        }
                        className="text-yellow-500 hover:text-yellow-700 font-medium flex items-center"
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
                            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                          />
                        </svg>
                        {test.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() =>
                          setConfirmDialog({
                            isOpen: true,
                            testId: test.id,
                            testTitle: test.title,
                          })
                        }
                        className="text-red-500 hover:text-red-700 font-medium flex items-center"
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
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Test"
        message={`Are you sure you want to delete "${confirmDialog.testTitle}"? This will delete all submissions and cannot be undone.`}
        onConfirm={handleDeleteTest}
        onCancel={() =>
          setConfirmDialog({ isOpen: false, testId: null, testTitle: "" })
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

export default TestManagement;

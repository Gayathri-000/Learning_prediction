import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { testService, courseService } from "../services/api";
import Navbar from "./Navbar";

const StudentTestList = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [tests, setTests] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      const [courseResponse, testsResponse, submissionsResponse] =
        await Promise.all([
          courseService.getCourse(courseId),
          testService.getCourseTestsStudent(courseId),
          testService.getMySubmissions(),
        ]);
      setCourse(courseResponse.data);
      setTests(testsResponse.data);
      setSubmissions(submissionsResponse.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionForTest = (testId) => {
    return submissions.find((s) => s.test_id === testId);
  };

  const isTestAvailable = (test) => {
    const now = new Date();
    const startTime = test.start_time ? new Date(test.start_time) : null;
    const endTime = test.end_time ? new Date(test.end_time) : null;

    if (startTime && now < startTime) return false;
    if (endTime && now > endTime) return false;
    return true;
  };

  const getTestStatus = (test) => {
    const submission = getSubmissionForTest(test.id);

    if (submission) {
      return {
        status: "completed",
        label: "Completed",
        color: "bg-green-100 text-green-700",
        action: "View Results",
      };
    }

    if (!isTestAvailable(test)) {
      const now = new Date();
      const startTime = test.start_time ? new Date(test.start_time) : null;
      const endTime = test.end_time ? new Date(test.end_time) : null;

      if (startTime && now < startTime) {
        return {
          status: "upcoming",
          label: "Upcoming",
          color: "bg-blue-100 text-blue-700",
          action: null,
        };
      }
      if (endTime && now > endTime) {
        return {
          status: "expired",
          label: "Expired",
          color: "bg-gray-100 text-gray-700",
          action: null,
        };
      }
    }

    return {
      status: "available",
      label: "Available",
      color: "bg-yellow-100 text-yellow-700",
      action: "Take Test",
    };
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

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              {course?.title}
            </h1>
            <p className="text-gray-600 mt-2">Available Tests</p>
          </div>

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
              <p className="text-gray-600 text-lg">
                No tests available at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tests.map((test) => {
                const status = getTestStatus(test);
                const submission = getSubmissionForTest(test.id);

                return (
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
                            className={`ml-3 px-3 py-1 text-sm font-medium rounded-full ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </div>
                        {test.description && (
                          <p className="text-gray-600 mb-3">
                            {test.description}
                          </p>
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
                            {test.total_questions}
                          </div>
                        </div>
                        {(test.start_time || test.end_time) && (
                          <div className="mt-3 text-sm text-gray-600">
                            {test.start_time && (
                              <div>
                                <span className="font-medium">
                                  Available from:
                                </span>{" "}
                                {new Date(test.start_time).toLocaleString()}
                              </div>
                            )}
                            {test.end_time && (
                              <div>
                                <span className="font-medium">
                                  Available until:
                                </span>{" "}
                                {new Date(test.end_time).toLocaleString()}
                              </div>
                            )}
                          </div>
                        )}
                        {submission && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Your Score:</span>{" "}
                              {submission.score?.toFixed(1)} /{" "}
                              {submission.total_marks} (
                              {submission.percentage?.toFixed(1)}%)
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                              <span className="font-medium">Submitted:</span>{" "}
                              {new Date(
                                submission.submitted_at,
                              ).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        {status.action && (
                          <button
                            onClick={() => {
                              if (status.status === "completed") {
                                navigate(
                                  `/student/test/result/${submission.id}`,
                                );
                              } else {
                                navigate(`/student/test/take/${test.id}`);
                              }
                            }}
                            className={`px-6 py-2 rounded-lg font-medium transition duration-200 ${
                              status.status === "completed"
                                ? "bg-blue-500 text-white hover:bg-blue-600"
                                : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                          >
                            {status.action}
                          </button>
                        )}
                        {!status.action && status.status === "upcoming" && (
                          <p className="text-sm text-gray-500 text-right">
                            Starts: {new Date(test.start_time).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentTestList;

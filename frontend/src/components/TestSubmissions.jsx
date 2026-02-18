import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { testService } from "../services/api";
import Navbar from "./Navbar";

const TestSubmissions = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("percentage"); // 'percentage', 'name', 'date'
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc', 'desc'

  useEffect(() => {
    fetchData();
  }, [testId]);

  const fetchData = async () => {
    try {
      const [testResponse, submissionsResponse] = await Promise.all([
        testService.getTest(testId),
        testService.getTestSubmissions(testId),
      ]);
      setTest(testResponse.data);
      setSubmissions(submissionsResponse.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const getSortedSubmissions = () => {
    const sorted = [...submissions].sort((a, b) => {
      let compareA, compareB;

      switch (sortBy) {
        case "percentage":
          compareA = a.percentage || 0;
          compareB = b.percentage || 0;
          break;
        case "name":
          compareA = a.student_name.toLowerCase();
          compareB = b.student_name.toLowerCase();
          break;
        case "date":
          compareA = new Date(a.submitted_at);
          compareB = new Date(b.submitted_at);
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });

    return sorted;
  };

  const getStats = () => {
    if (submissions.length === 0)
      return { avg: 0, highest: 0, lowest: 0, passRate: 0 };

    const scores = submissions.map((s) => s.percentage || 0);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passRate =
      (submissions.filter((s) => (s.percentage || 0) >= 50).length /
        submissions.length) *
      100;

    return { avg, highest, lowest, passRate };
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-blue-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading submissions...</p>
          </div>
        </div>
      </>
    );
  }

  const stats = getStats();
  const sortedSubmissions = getSortedSubmissions();

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

          {/* Test Info */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {test?.title}
            </h1>
            <p className="text-gray-600">Test Submissions</p>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Total Marks:</span>{" "}
                {test?.total_marks}
              </div>
              <div>
                <span className="font-medium">Passing Marks:</span>{" "}
                {test?.passing_marks}
              </div>
              <div>
                <span className="font-medium">Questions:</span>{" "}
                {test?.questions?.length || 0}
              </div>
              <div>
                <span className="font-medium">Submissions:</span>{" "}
                {submissions.length}
              </div>
            </div>
          </div>

          {/* Statistics */}
          {submissions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600 mb-2">Average Score</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.avg.toFixed(1)}%
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600 mb-2">Highest Score</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.highest.toFixed(1)}%
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600 mb-2">Lowest Score</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.lowest.toFixed(1)}%
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600 mb-2">Pass Rate</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.passRate.toFixed(1)}%
                </p>
              </div>
            </div>
          )}

          {/* Submissions Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Student Submissions
              </h2>
              <div className="flex items-center space-x-4">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="percentage">Score</option>
                  <option value="name">Name</option>
                  <option value="date">Date</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="text-blue-500 hover:text-blue-700"
                >
                  <svg
                    className={`w-5 h-5 transform ${sortOrder === "desc" ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 11l5-5m0 0l5 5m-5-5v12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {submissions.length === 0 ? (
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-600 text-lg">No submissions yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        #
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Student Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Score
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Percentage
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Submitted At
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSubmissions.map((submission, index) => (
                      <tr
                        key={submission.id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                        <td className="py-3 px-4 font-medium text-gray-800">
                          {submission.student_name}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {submission.score?.toFixed(1)} /{" "}
                          {submission.total_marks}
                        </td>
                        <td
                          className={`py-3 px-4 font-semibold ${getGradeColor(submission.percentage || 0)}`}
                        >
                          {submission.percentage?.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              (submission.percentage || 0) >= 50
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {(submission.percentage || 0) >= 50
                              ? "Pass"
                              : "Fail"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {submission.submitted_at
                            ? new Date(submission.submitted_at).toLocaleString()
                            : "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() =>
                              navigate(`/teacher/submission/${submission.id}`)
                            }
                            className="text-blue-500 hover:text-blue-700 font-medium"
                          >
                            View Details →
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
    </>
  );
};

export default TestSubmissions;

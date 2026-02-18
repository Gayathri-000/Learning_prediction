import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { testService } from "../services/api";
import Navbar from "./Navbar";

const TestResult = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSubmission();
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      const response = await testService.getSubmissionDetails(submissionId);
      setSubmission(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: "A+", color: "text-green-600" };
    if (percentage >= 80) return { grade: "A", color: "text-green-600" };
    if (percentage >= 70) return { grade: "B", color: "text-blue-600" };
    if (percentage >= 60) return { grade: "C", color: "text-yellow-600" };
    if (percentage >= 50) return { grade: "D", color: "text-orange-600" };
    return { grade: "F", color: "text-red-600" };
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading results...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 text-blue-500 hover:text-blue-700 font-medium"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  const { grade, color } = getGrade(submission.percentage);
  const passed =
    submission.percentage >=
    (submission.total_marks / submission.total_marks) * 100;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
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

          {/* Results Summary */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {submission.test_title}
              </h1>
              <p className="text-gray-600">Test Results</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-2">Your Score</p>
                <p className="text-4xl font-bold text-blue-600">
                  {submission.score?.toFixed(1)} / {submission.total_marks}
                </p>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-2">Percentage</p>
                <p className={`text-4xl font-bold ${color}`}>
                  {submission.percentage?.toFixed(1)}%
                </p>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-2">Grade</p>
                <p className={`text-4xl font-bold ${color}`}>{grade}</p>
              </div>
            </div>

            <div
              className={`p-6 rounded-lg ${passed ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
            >
              <div className="flex items-center justify-center">
                {passed ? (
                  <>
                    <svg
                      className="w-8 h-8 text-green-600 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-xl font-semibold text-green-800">
                      Congratulations! You Passed!
                    </span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-8 h-8 text-red-600 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-xl font-semibold text-red-800">
                      Better Luck Next Time
                    </span>
                  </>
                )}
              </div>
            </div>

            {submission.submitted_at && (
              <div className="mt-6 text-center text-gray-600">
                <p>
                  Submitted on{" "}
                  {new Date(submission.submitted_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Detailed Answers */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Answer Review
            </h2>

            <div className="space-y-6">
              {submission.answers.map((answer, index) => (
                <div
                  key={answer.id}
                  className={`border-l-4 rounded-lg p-6 ${
                    answer.is_correct
                      ? "border-green-500 bg-green-50"
                      : "border-red-500 bg-red-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start flex-1">
                      <span className="flex-shrink-0 w-8 h-8 bg-gray-700 text-white rounded-full flex items-center justify-center font-bold mr-3">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-lg font-medium text-gray-800 mb-2">
                          {answer.question_text}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center ml-4">
                      {answer.is_correct ? (
                        <div className="flex items-center text-green-600">
                          <svg
                            className="w-6 h-6 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="font-semibold">Correct</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <svg
                            className="w-6 h-6 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="font-semibold">Incorrect</span>
                        </div>
                      )}
                      <span className="ml-3 font-semibold text-gray-700">
                        {answer.marks_awarded}/
                        {answer.marks_awarded +
                          (answer.is_correct
                            ? 0
                            : parseFloat(
                                answer.question_text.match(/\d+/)?.[0],
                              ) || 1)}
                      </span>
                    </div>
                  </div>

                  <div className="ml-11 space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Your Answer:
                      </p>
                      <p
                        className={`text-gray-800 ${answer.is_correct ? "text-green-700" : "text-red-700"}`}
                      >
                        {answer.answer_text || "(No answer provided)"}
                      </p>
                    </div>

                    {!answer.is_correct && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          Correct Answer:
                        </p>
                        <p className="text-green-700 font-medium">
                          {answer.correct_answer}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200 font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestResult;

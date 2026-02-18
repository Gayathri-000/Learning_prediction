import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { testService } from "../services/api";
import Navbar from "./Navbar";
import ConfirmDialog from "./ConfirmDialog";

const TakeTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  useEffect(() => {
    fetchTest();
  }, [testId]);

  useEffect(() => {
    if (test && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [test, timeRemaining]);

  const fetchTest = async () => {
    try {
      const response = await testService.getTestForStudent(testId);
      setTest(response.data);
      setTimeRemaining(response.data.duration_minutes * 60);

      // Initialize answers
      const initialAnswers = {};
      response.data.questions.forEach((q) => {
        initialAnswers[q.id] = "";
      });
      setAnswers(initialAnswers);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load test");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleAutoSubmit = async () => {
    await handleSubmit(true);
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    if (!isAutoSubmit) {
      setConfirmSubmit(false);
    }

    setSubmitting(true);
    setError("");

    try {
      const answersArray = Object.entries(answers).map(
        ([questionId, answerText]) => ({
          question_id: parseInt(questionId),
          answer_text: answerText || "",
        }),
      );

      const response = await testService.submitTest({
        test_id: parseInt(testId),
        answers: answersArray,
      });

      // Navigate to results page
      navigate(`/student/test/result/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit test");
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getAnsweredCount = () => {
    return Object.values(answers).filter((a) => a.trim() !== "").length;
  };

  const parseOptions = (optionsString) => {
    if (!optionsString) return [];
    // Split by newline or comma
    return optionsString
      .split(/[\n,]/)
      .map((opt) => opt.trim())
      .filter((opt) => opt);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading test...</p>
          </div>
        </div>
      </>
    );
  }

  if (error && !test) {
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Timer and Progress Bar */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-4 z-10">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {test.title}
                </h1>
                <p className="text-gray-600 mt-1">
                  Progress: {getAnsweredCount()} / {test.questions.length}{" "}
                  answered
                </p>
              </div>
              <div className="text-right">
                <div
                  className={`text-3xl font-bold ${timeRemaining < 300 ? "text-red-600" : "text-blue-600"}`}
                >
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-sm text-gray-600">Time Remaining</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(getAnsweredCount() / test.questions.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {timeRemaining < 300 && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm font-medium">
                  ⚠️ Less than 5 minutes remaining! The test will auto-submit
                  when time expires.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Test Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Answer all questions to the best of your ability</li>
              <li>• You can navigate between questions freely</li>
              <li>• Click "Submit Test" when you're done</li>
              <li>• The test will auto-submit when time expires</li>
              <li>
                • Total Marks: {test.total_marks} | Passing Marks:{" "}
                {test.passing_marks}
              </li>
            </ul>
          </div>

          {/* Questions */}
          <div className="space-y-6 mb-6">
            {test.questions
              .sort((a, b) => a.order - b.order)
              .map((question, index) => (
                <div
                  key={question.id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex items-start mb-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-lg font-medium text-gray-800 mb-2">
                        {question.question_text}
                      </p>
                      <p className="text-sm text-gray-600">
                        {question.marks}{" "}
                        {question.marks === 1 ? "mark" : "marks"}
                      </p>
                    </div>
                    {answers[question.id]?.trim() && (
                      <span className="text-green-600 font-medium text-sm">
                        ✓ Answered
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    {question.question_type === "mcq" && (
                      <div className="space-y-2">
                        {parseOptions(question.options).map(
                          (option, optIndex) => (
                            <label
                              key={optIndex}
                              className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                                answers[question.id] === option
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-300 hover:border-blue-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={option}
                                checked={answers[question.id] === option}
                                onChange={(e) =>
                                  handleAnswerChange(
                                    question.id,
                                    e.target.value,
                                  )
                                }
                                className="mr-3"
                              />
                              <span className="text-gray-700">{option}</span>
                            </label>
                          ),
                        )}
                      </div>
                    )}

                    {question.question_type === "true_false" && (
                      <div className="space-y-2">
                        {["True", "False"].map((option) => (
                          <label
                            key={option}
                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                              answers[question.id] === option
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300 hover:border-blue-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={option}
                              checked={answers[question.id] === option}
                              onChange={(e) =>
                                handleAnswerChange(question.id, e.target.value)
                              }
                              className="mr-3"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.question_type === "short_answer" && (
                      <textarea
                        value={answers[question.id] || ""}
                        onChange={(e) =>
                          handleAnswerChange(question.id, e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Type your answer here..."
                      />
                    )}
                  </div>
                </div>
              ))}
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-md p-6 sticky bottom-4">
            <div className="flex items-center justify-between">
              <div className="text-gray-600">
                <p className="font-medium">Ready to submit?</p>
                <p className="text-sm">
                  You've answered {getAnsweredCount()} out of{" "}
                  {test.questions.length} questions
                </p>
              </div>
              <button
                onClick={() => setConfirmSubmit(true)}
                disabled={submitting}
                className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition duration-200 font-medium disabled:bg-green-300 flex items-center"
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Submit Test
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmSubmit}
        title="Submit Test"
        message={`You have answered ${getAnsweredCount()} out of ${test.questions.length} questions. Are you sure you want to submit? You cannot change your answers after submission.`}
        onConfirm={() => handleSubmit(false)}
        onCancel={() => setConfirmSubmit(false)}
        confirmText="Yes, Submit"
        cancelText="Review Answers"
        type="warning"
      />
    </>
  );
};

export default TakeTest;

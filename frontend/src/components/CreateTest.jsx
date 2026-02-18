import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { testService } from "../services/api";
import Navbar from "./Navbar";

const CreateTest = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [testData, setTestData] = useState({
    title: "",
    description: "",
    total_marks: 0,
    passing_marks: 0,
    duration_minutes: 60,
    start_time: "",
    end_time: "",
  });

  const [questions, setQuestions] = useState([
    {
      question_text: "",
      question_type: "mcq",
      marks: 1,
      options: "",
      correct_answer: "",
      order: 0,
    },
  ]);

  const questionTypes = [
    { value: "mcq", label: "Multiple Choice" },
    { value: "true_false", label: "True/False" },
    { value: "short_answer", label: "Short Answer" },
  ];

  const handleTestChange = (e) => {
    const { name, value } = e.target;
    setTestData({ ...testData, [name]: value });
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        question_type: "mcq",
        marks: 1,
        options: "",
        correct_answer: "",
        order: questions.length,
      },
    ]);
  };

  const removeQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    // Update order
    newQuestions.forEach((q, i) => (q.order = i));
    setQuestions(newQuestions);
  };

  const calculateTotalMarks = () => {
    return questions.reduce((sum, q) => sum + parseFloat(q.marks || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (questions.length === 0) {
      setError("Please add at least one question");
      return;
    }

    const totalMarks = calculateTotalMarks();
    if (parseFloat(testData.passing_marks) > totalMarks) {
      setError("Passing marks cannot be greater than total marks");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...testData,
        course_id: parseInt(courseId),
        total_marks: totalMarks,
        passing_marks: parseFloat(testData.passing_marks),
        duration_minutes: parseInt(testData.duration_minutes),
        start_time: testData.start_time || null,
        end_time: testData.end_time || null,
        questions: questions.map((q) => ({
          ...q,
          marks: parseFloat(q.marks),
          order: parseInt(q.order),
        })),
      };

      await testService.createTest(payload);
      navigate(`/teacher/course/${courseId}/tests`);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create test");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
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

          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Create New Test
            </h1>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Test Details */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Test Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2">
                      Test Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={testData.title}
                      onChange={handleTestChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Midterm Exam"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={testData.description}
                      onChange={handleTestChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Brief description of the test..."
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Passing Marks *
                    </label>
                    <input
                      type="number"
                      name="passing_marks"
                      value={testData.passing_marks}
                      onChange={handleTestChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.5"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Duration (minutes) *
                    </label>
                    <input
                      type="number"
                      name="duration_minutes"
                      value={testData.duration_minutes}
                      onChange={handleTestChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Start Time (optional)
                    </label>
                    <input
                      type="datetime-local"
                      name="start_time"
                      value={testData.start_time}
                      onChange={handleTestChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      End Time (optional)
                    </label>
                    <input
                      type="datetime-local"
                      name="end_time"
                      value={testData.end_time}
                      onChange={handleTestChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Total Marks:</span>{" "}
                    {calculateTotalMarks()}
                  </p>
                </div>
              </div>

              {/* Questions */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Questions
                  </h2>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200 font-medium flex items-center"
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
                    Add Question
                  </button>
                </div>

                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <div
                      key={index}
                      className="border border-gray-300 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">
                          Question {index + 1}
                        </h3>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg
                              className="w-5 h-5"
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
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-gray-700 font-medium mb-2">
                            Question Text *
                          </label>
                          <textarea
                            value={question.question_text}
                            onChange={(e) =>
                              handleQuestionChange(
                                index,
                                "question_text",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="2"
                            placeholder="Enter your question..."
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            Question Type *
                          </label>
                          <select
                            value={question.question_type}
                            onChange={(e) =>
                              handleQuestionChange(
                                index,
                                "question_type",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {questionTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            Marks *
                          </label>
                          <input
                            type="number"
                            value={question.marks}
                            onChange={(e) =>
                              handleQuestionChange(
                                index,
                                "marks",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0.5"
                            step="0.5"
                            required
                          />
                        </div>

                        {question.question_type === "mcq" && (
                          <div className="md:col-span-2">
                            <label className="block text-gray-700 font-medium mb-2">
                              Options * (one per line or comma-separated)
                            </label>
                            <textarea
                              value={question.options}
                              onChange={(e) =>
                                handleQuestionChange(
                                  index,
                                  "options",
                                  e.target.value,
                                )
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows="3"
                              placeholder="Option A&#10;Option B&#10;Option C&#10;Option D"
                              required={question.question_type === "mcq"}
                            />
                          </div>
                        )}

                        <div className="md:col-span-2">
                          <label className="block text-gray-700 font-medium mb-2">
                            Correct Answer *
                          </label>
                          {question.question_type === "true_false" ? (
                            <select
                              value={question.correct_answer}
                              onChange={(e) =>
                                handleQuestionChange(
                                  index,
                                  "correct_answer",
                                  e.target.value,
                                )
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            >
                              <option value="">Select...</option>
                              <option value="True">True</option>
                              <option value="False">False</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={question.correct_answer}
                              onChange={(e) =>
                                handleQuestionChange(
                                  index,
                                  "correct_answer",
                                  e.target.value,
                                )
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={
                                question.question_type === "mcq"
                                  ? "e.g., Option A"
                                  : "Enter correct answer"
                              }
                              required
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200 font-medium disabled:bg-blue-300"
                >
                  {loading ? "Creating Test..." : "Create Test"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateTest;

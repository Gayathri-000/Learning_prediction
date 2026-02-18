import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { qaService, courseService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import ConfirmDialog from "./ConfirmDialog";

const CourseQA = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: "", content: "" });
  const [answerForms, setAnswerForms] = useState({});
  const [answerContents, setAnswerContents] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    action: null,
    id: null,
  });

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      const [courseResponse, questionsResponse] = await Promise.all([
        courseService.getCourse(courseId),
        qaService.getQuestions(courseId),
      ]);
      setCourse(courseResponse.data);
      setQuestions(questionsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load Q&A. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await qaService.createQuestion({
        ...newQuestion,
        course_id: parseInt(courseId),
      });
      setSuccess("Question posted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      setNewQuestion({ title: "", content: "" });
      setShowQuestionForm(false);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to post question");
    }
  };

  const handleCreateAnswer = async (questionId) => {
    setError("");
    try {
      await qaService.createAnswer({
        question_id: questionId,
        content: answerContents[questionId] || "",
      });
      setSuccess("Answer posted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      setAnswerContents({ ...answerContents, [questionId]: "" });
      setAnswerForms({ ...answerForms, [questionId]: false });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to post answer");
    }
  };

  const handleDeleteQuestion = async () => {
    try {
      await qaService.deleteQuestion(confirmDialog.id);
      setSuccess("Question deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete question");
    } finally {
      setConfirmDialog({ isOpen: false, action: null, id: null });
    }
  };

  const handleDeleteAnswer = async () => {
    try {
      await qaService.deleteAnswer(confirmDialog.id);
      setSuccess("Answer deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete answer");
    } finally {
      setConfirmDialog({ isOpen: false, action: null, id: null });
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading Q&A...</p>
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
                <p className="text-gray-600 mt-2">Q&A Discussion Board</p>
              </div>
              {user.role === "student" && (
                <button
                  onClick={() => setShowQuestionForm(!showQuestionForm)}
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
                  Ask Question
                </button>
              )}
            </div>
          </div>

          {showQuestionForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                Post a New Question
              </h2>
              <form onSubmit={handleCreateQuestion}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Question Title
                  </label>
                  <input
                    type="text"
                    value={newQuestion.title}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief summary of your question..."
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Question Details
                  </label>
                  <textarea
                    value={newQuestion.content}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        content: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Describe your question in detail..."
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-200 font-medium"
                  >
                    Post Question
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuestionForm(false);
                      setNewQuestion({ title: "", content: "" });
                    }}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition duration-200 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-6">
            {questions.length === 0 ? (
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
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-600 text-lg">No questions yet.</p>
                {user.role === "student" && (
                  <p className="text-gray-500 mt-2">
                    Be the first to ask a question!
                  </p>
                )}
              </div>
            ) : (
              questions.map((question) => (
                <div
                  key={question.id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {question.title}
                        </h3>
                        {question.is_answered && (
                          <span className="ml-3 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                            ✓ Answered
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{question.content}</p>
                      <div className="flex items-center text-sm text-gray-500">
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
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>{question.student_name}</span>
                        <span className="mx-2">•</span>
                        <span>
                          {new Date(question.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {(user.role === "student" &&
                      question.student_id === user.id) ||
                    user.role === "teacher" ? (
                      <button
                        onClick={() =>
                          setConfirmDialog({
                            isOpen: true,
                            action: "deleteQuestion",
                            id: question.id,
                          })
                        }
                        className="text-red-500 hover:text-red-700 ml-4"
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
                    ) : null}
                  </div>

                  {question.answers.length > 0 && (
                    <div className="mt-4 space-y-4">
                      {question.answers.map((answer) => (
                        <div
                          key={answer.id}
                          className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-gray-700 mb-2">
                                {answer.content}
                              </p>
                              <div className="flex items-center text-sm text-gray-600">
                                <svg
                                  className="w-4 h-4 mr-1 text-blue-600"
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
                                <span className="font-medium">
                                  {answer.teacher_name}
                                </span>
                                <span className="mx-2">•</span>
                                <span>
                                  {new Date(
                                    answer.created_at,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            {user.role === "teacher" && (
                              <button
                                onClick={() =>
                                  setConfirmDialog({
                                    isOpen: true,
                                    action: "deleteAnswer",
                                    id: answer.id,
                                  })
                                }
                                className="text-red-500 hover:text-red-700 ml-4"
                              >
                                <svg
                                  className="w-4 h-4"
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
                        </div>
                      ))}
                    </div>
                  )}

                  {user.role === "teacher" && (
                    <div className="mt-4">
                      {!answerForms[question.id] ? (
                        <button
                          onClick={() =>
                            setAnswerForms({
                              ...answerForms,
                              [question.id]: true,
                            })
                          }
                          className="text-blue-500 hover:text-blue-700 font-medium flex items-center"
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
                              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                            />
                          </svg>
                          Answer this question
                        </button>
                      ) : (
                        <div className="mt-4">
                          <textarea
                            value={answerContents[question.id] || ""}
                            onChange={(e) =>
                              setAnswerContents({
                                ...answerContents,
                                [question.id]: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            placeholder="Type your answer..."
                          />
                          <div className="flex space-x-3 mt-3">
                            <button
                              onClick={() => handleCreateAnswer(question.id)}
                              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200 font-medium"
                            >
                              Post Answer
                            </button>
                            <button
                              onClick={() => {
                                setAnswerForms({
                                  ...answerForms,
                                  [question.id]: false,
                                });
                                setAnswerContents({
                                  ...answerContents,
                                  [question.id]: "",
                                });
                              }}
                              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-200 font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={
          confirmDialog.action === "deleteQuestion"
            ? "Delete Question"
            : "Delete Answer"
        }
        message={
          confirmDialog.action === "deleteQuestion"
            ? "Are you sure you want to delete this question? This will also delete all answers. This action cannot be undone."
            : "Are you sure you want to delete this answer? This action cannot be undone."
        }
        onConfirm={
          confirmDialog.action === "deleteQuestion"
            ? handleDeleteQuestion
            : handleDeleteAnswer
        }
        onCancel={() =>
          setConfirmDialog({ isOpen: false, action: null, id: null })
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

export default CourseQA;

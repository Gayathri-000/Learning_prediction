import axios from "axios";

const API_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication services
export const authService = {
  signup: (data) => api.post("/auth/signup", data),

  login: (email, password) => {
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);
    return api.post("/auth/login", formData);
  },

  getCurrentUser: () => api.get("/auth/me"),
};

// Course services
export const courseService = {
  getCourses: () => api.get("/courses/"),
  getCourse: (id) => api.get(`/courses/${id}`),
  createCourse: (data) => api.post("/courses/", data),
  enrollStudent: (courseId, studentId) =>
    api.post(`/courses/${courseId}/enroll/${studentId}`),
  unenrollStudent: (courseId, studentId) =>  // Add this new method
    api.delete(`/courses/${courseId}/unenroll/${studentId}`),
  getCourseStudents: (courseId) => api.get(`/courses/${courseId}/students`),
};

// Student services
export const studentService = {
  getEnrollments: () => api.get("/students/enrollments"),
  getEnrollment: (id) => api.get(`/students/enrollments/${id}`),
  updateEnrollment: (id, data) => api.put(`/students/enrollments/${id}`, data),
  predictOutcome: (id) => api.post(`/students/enrollments/${id}/predict`),
  getPrediction: (id) => api.get(`/students/enrollments/${id}/prediction`),
};

// Q&A services
export const qaService = {
  getQuestions: (courseId) => api.get(`/qa/courses/${courseId}/questions`),
  createQuestion: (data) => api.post('/qa/questions', data),
  createAnswer: (data) => api.post('/qa/answers', data),
  deleteQuestion: (id) => api.delete(`/qa/questions/${id}`),
  deleteAnswer: (id) => api.delete(`/qa/answers/${id}`),
};

// Tests services
export const testService = {
  // Teacher endpoints
  createTest: (data) => api.post('/tests/', data),
  getCourseTests: (courseId) => api.get(`/tests/course/${courseId}`),
  getTest: (testId) => api.get(`/tests/${testId}`),
  updateTest: (testId, data) => api.patch(`/tests/${testId}`, data),
  deleteTest: (testId) => api.delete(`/tests/${testId}`),
  getTestSubmissions: (testId) => api.get(`/tests/${testId}/submissions`),
  
  // Student endpoints
  getCourseTestsStudent: (courseId) => api.get(`/tests/course/${courseId}/student`),
  getTestForStudent: (testId) => api.get(`/tests/${testId}/student`),
  submitTest: (data) => api.post('/tests/submit', data),
  getMySubmissions: () => api.get('/tests/submissions/my'),
  getSubmissionDetails: (submissionId) => api.get(`/tests/submission/${submissionId}`),
};

// ADD THESE LINES TO YOUR EXISTING frontend/src/services/api.js FILE

// Video services (ADD THIS SECTION)
export const videoService = {
  getCourseVideos: (courseId) => api.get(`/videos/course/${courseId}`),
  getVideo: (videoId) => api.get(`/videos/${videoId}`),
  createVideo: (data) => api.post('/videos/', data),
  updateVideo: (videoId, data) => api.put(`/videos/${videoId}`, data),
  deleteVideo: (videoId) => api.delete(`/videos/${videoId}`),
  updateProgress: (videoId, data) => api.post(`/videos/${videoId}/progress`, data),
  getCourseProgress: (courseId) => api.get(`/videos/course/${courseId}/progress`),
  getVideoStats: (courseId) => api.get(`/videos/course/${courseId}/stats`),
};

// Add resources service
export const resourceService = {
  getResources: (courseId) => api.get(`/resources/courses/${courseId}`),
  createResource: (data) => api.post('/resources/', data),
  trackClick: (resourceId) => api.post(`/resources/${resourceId}/click`),
  deleteResource: (id) => api.delete(`/resources/${id}`),
};

export default api;

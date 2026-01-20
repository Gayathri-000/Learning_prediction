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

export default api;

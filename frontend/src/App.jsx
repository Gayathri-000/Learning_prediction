import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import CourseManagement from "./components/CourseManagement";
import EnrollmentDetails from "./components/EnrollmentDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import CourseQA from "./components/CourseQA";
import TeacherDashboard from "./components/TeacherDashboard";

import TestManagement from "./components/TestManagement";
import CreateTest from "./components/CreateTest";
import TakeTest from "./components/TakeTest";
import TestResult from "./components/TestResult";
import TestSubmissions from "./components/TestSubmissions";
import StudentTestList from "./components/StudentTestList";

import VideoManagement from "./components/VideoManagement";
import CourseVideos from "./components/CourseVideos";
import VideoPlayer from "./components/VideoPlayer";

import CourseResources from "./components/CourseResources";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/course/:courseId/manage"
            element={
              <ProtectedRoute>
                <CourseManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enrollment/:enrollmentId"
            element={
              <ProtectedRoute>
                <EnrollmentDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/enrollment/:enrollmentId"
            element={
              <ProtectedRoute>
                <EnrollmentDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course/:courseId/qa"
            element={
              <ProtectedRoute>
                <CourseQA />
              </ProtectedRoute>
            }
          />
          {/* Student Test Routes */}
          <Route
            path="/student/course/:courseId/tests"
            element={
              <ProtectedRoute>
                <StudentTestList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/test/take/:testId"
            element={
              <ProtectedRoute>
                <TakeTest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/test/result/:submissionId"
            element={
              <ProtectedRoute>
                <TestResult />
              </ProtectedRoute>
            }
          />
          {/* Teacher Routes */}
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          {/* Teacher Test Routes */}
          <Route
            path="/teacher/course/:courseId/tests"
            element={
              <ProtectedRoute>
                <TestManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/course/:courseId/test/create"
            element={
              <ProtectedRoute>
                <CreateTest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/test/:testId/submissions"
            element={
              <ProtectedRoute>
                <TestSubmissions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/submission/:submissionId"
            element={
              <ProtectedRoute>
                <TestResult />
              </ProtectedRoute>
            }
          />
          {/* Teacher Video Management */}
          <Route
            path="/teacher/course/:courseId/videos"
            element={
              <ProtectedRoute>
                <VideoManagement />
              </ProtectedRoute>
            }
          />
          {/* Student Video Routes */}
          <Route
            path="/student/course/:courseId/videos"
            element={
              <ProtectedRoute>
                <CourseVideos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/video/:videoId"
            element={
              <ProtectedRoute>
                <VideoPlayer />
              </ProtectedRoute>
            }
          />
          // Add route:
          <Route
            path="/course/:courseId/resources"
            element={
              <ProtectedRoute>
                <CourseResources />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

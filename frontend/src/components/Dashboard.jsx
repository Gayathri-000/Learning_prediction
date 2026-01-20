import React from "react";
import { useAuth } from "../context/AuthContext";
import StudentDashboard from "./StudentDashboard";
import TeacherDashboard from "./TeacherDashboard";

const Dashboard = () => {
  const { user } = useAuth();

  if (user.role === "student") {
    return <StudentDashboard />;
  } else {
    return <TeacherDashboard />;
  }
};

export default Dashboard;

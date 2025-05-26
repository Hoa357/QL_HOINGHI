import './App.css';
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Login from './features/auth/Login';
import ManageActivities from './features/manage/manage_activities';
import ManageAttendance from './features/manage/manage_attendance';
import Statistics from './features/stats/statistics';
import ManageScoresPage from './features/manage/manage_scores';
import AdminProfile from './features/auth/admin_profile';
import AdminDashboard from './features/dashboard/dashboard';
import QRCheckin from './features/manage/qr_checkin';


function RedirectToLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login");
  }, [navigate]);

  return null;
}

function App() {
  return (
    <Router>
      <Routes>
        {/*  Trang mặc định sẽ chuyển hướng đến /login */}
        <Route path="/" element={<RedirectToLogin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin_dashboard" element={<AdminDashboard />} />
        <Route path="/manage_activities" element={<ManageActivities />} />
        <Route path="/manage_attendance" element={<ManageAttendance />} />
        <Route path="/qr_checkin" element={<QRCheckin />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/manage_scores" element={<ManageScoresPage />} />
        <Route path="/admin_profile" element={<AdminProfile />} />
      </Routes>
    </Router>
  );
}

export default App;

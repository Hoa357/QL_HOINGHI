"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Calendar, Users, Clock, Search, Download } from "lucide-react";

const ManageRegistrationsPage = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activityInfo, setActivityInfo] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "/login";
      } else {
        // Set default date to today
        const today = new Date().toISOString().split("T")[0];
        setSelectedDate(today);
        loadActivitiesByDate(today);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadActivitiesByDate(selectedDate);
      setSelectedActivity("");
      setRegistrations([]);
      setActivityInfo(null);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedActivity) {
      loadRegistrations(selectedActivity);
    }
  }, [selectedActivity]);

  const loadActivitiesByDate = async (date) => {
    try {
      setLoading(true);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, "activities"),
        where("startTime", ">=", startOfDay),
        where("startTime", "<=", endOfDay),
        orderBy("startTime", "asc")
      );

      const querySnapshot = await getDocs(q);
      const fetchedActivities = [];

      querySnapshot.forEach((doc) => {
        fetchedActivities.push({
          id: doc.id,
          ...doc.data(),
          startTime:
            doc.data().startTime?.toDate?.() || new Date(doc.data().startTime),
        });
      });

      setActivities(fetchedActivities);
    } catch (error) {
      console.error("Lỗi tải hoạt động:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrations = async (activityId) => {
    try {
      setLoading(true);

      // Load activity info
      const activity = activities.find((a) => a.id === activityId);
      setActivityInfo(activity);

      // Load registrations
      const q = query(
        collection(db, "registrations"),
        where("activityId", "==", activityId),
        orderBy("registeredAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const fetchedRegistrations = [];
      let index = 1;

      querySnapshot.forEach((doc) => {
        fetchedRegistrations.push({
          id: doc.id,
          stt: index++,
          ...doc.data(),
          registeredAt:
            doc.data().registeredAt?.toDate?.() ||
            new Date(doc.data().registeredAt),
        });
      });

      setRegistrations(fetchedRegistrations);
    } catch (error) {
      console.error("Lỗi tải danh sách đăng ký:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "";
    return date.toLocaleString("vi-VN");
  };

  const formatTime = (date) => {
    if (!date) return "";
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportToExcel = () => {
    alert("Chức năng xuất Excel sẽ được cập nhật sau.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-900 text-white px-6 py-4 flex justify-between flex-wrap items-center">
        <div className="flex items-center gap-3">
          <img src="assets/images/logo.png" alt="Logo" className="w-10 h-10" />
          <h1 className="text-lg font-bold">Công Nghệ Thông Tin</h1>
        </div>
        <nav>
          <ul className="flex flex-wrap gap-3 items-center">
            <li>
              <a
                href="/admin_dashboard"
                className="px-3 py-2 font-semibold hover:underline"
              >
                Trang chủ
              </a>
            </li>
            <li>
              <a
                href="/manage_activities"
                className="px-3 py-2 font-semibold hover:underline"
              >
                Quản lý hoạt động
              </a>
            </li>
            <li>
              <a
                href="/manage_attendance"
                className="px-3 py-2 font-semibold hover:underline"
              >
                Điểm danh
              </a>
            </li>
            <li>
              <a
                href="/manage_scores"
                className="px-3 py-2 font-semibold hover:underline"
              >
                Danh sách đăng ký
              </a>
            </li>
            <li>
              <a
                href="/statistics"
                className="px-3 py-2 font-semibold hover:underline"
              >
                Thống kê
              </a>
            </li>
            <li>
              <a
                href="/admin_profile"
                className="px-3 py-2 font-semibold hover:underline"
              >
                Tài khoản
              </a>
            </li>
            <li>
              <a
                href="/login"
                className="px-3 py-2 bg-indigo-600 rounded font-semibold hover:bg-indigo-700"
              >
                Đăng xuất
              </a>
            </li>
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-indigo-900 mb-6">
            Danh sách sinh viên đăng ký
          </h2>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Chọn ngày diễn ra hoạt động
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Activity Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Search className="inline w-4 h-4 mr-1" />
                  Chọn hoạt động
                </label>
                <select
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={activities.length === 0}
                >
                  <option value="">-- Chọn hoạt động --</option>
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.title} - {formatTime(activity.startTime)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading && (
              <div className="text-center py-4">
                <div className="inline-flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                  Đang tải...
                </div>
              </div>
            )}

            {activities.length === 0 && selectedDate && !loading && (
              <div className="text-center py-4 text-gray-500">
                Không có hoạt động nào trong ngày{" "}
                {new Date(selectedDate).toLocaleDateString("vi-VN")}
              </div>
            )}
          </div>

          {/* Activity Info */}
          {activityInfo && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {activityInfo.title}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <Clock className="inline w-4 h-4 mr-1" />
                      Thời gian: {formatDateTime(activityInfo.startTime)}
                    </p>
                    <p>📍 Địa điểm: {activityInfo.location}</p>
                    <p>
                      🎯 Loại:{" "}
                      {activityInfo.activityType === "khoa"
                        ? "Hoạt động Khoa"
                        : "Hoạt động Đoàn"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-indigo-100 rounded-lg p-4">
                    <div className="flex items-center text-indigo-800">
                      <Users className="w-5 h-5 mr-2" />
                      <span className="text-lg font-semibold">
                        {registrations.length} / {activityInfo.maxParticipants}
                      </span>
                    </div>
                    <p className="text-sm text-indigo-600 mt-1">
                      Đã đăng ký / Tối đa
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Registrations Table */}
          {selectedActivity && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  Danh sách sinh viên đã đăng ký ({registrations.length})
                </h3>
                <button
                  onClick={exportToExcel}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                >
                  <Download className="w-4 h-4" />
                  Xuất Excel
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã sinh viên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên sinh viên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lớp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày giờ đăng ký
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {registrations.map((registration) => (
                      <tr key={registration.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {registration.stt}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {registration.studentId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {registration.studentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {registration.studentClass}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(registration.registeredAt)}
                        </td>
                      </tr>
                    ))}
                    {registrations.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          {selectedActivity
                            ? "Chưa có sinh viên nào đăng ký hoạt động này."
                            : "Vui lòng chọn hoạt động để xem danh sách đăng ký."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-indigo-900 text-white text-center py-4 text-sm">
        &copy; 2025 Công Nghệ Thông Tin - HUIT
      </footer>
    </div>
  );
};

export default ManageRegistrationsPage;

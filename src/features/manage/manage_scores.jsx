"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Calendar, Users, Clock, Search, Download } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

const ManageRegistrationsPage = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activityInfo, setActivityInfo] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrToken, setQrToken] = useState("");

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "/login";
      } else {
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

      const activity = activities.find((a) => a.id === activityId);
      setActivityInfo(activity);

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
          attendance: doc.data().attendance || false,
        });
      });

      setRegistrations(fetchedRegistrations);
    } catch (error) {
      console.error("Lỗi tải danh sách đăng ký:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = async (registrationId) => {
    try {
      const registration = registrations.find(
        (reg) => reg.id === registrationId
      );
      const newAttendance = !registration.attendance;

      // Update local state
      setRegistrations((prevRegistrations) =>
        prevRegistrations.map((reg) =>
          reg.id === registrationId
            ? { ...reg, attendance: newAttendance }
            : reg
        )
      );

      // Update Firebase
      await updateDoc(doc(db, "registrations", registrationId), {
        attendance: newAttendance,
      });
    } catch (error) {
      console.error("Lỗi cập nhật điểm danh:", error);
      alert("Không thể cập nhật trạng thái điểm danh. Vui lòng thử lại.");
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

  const generateQRCode = async () => {
    const confirm = window.confirm(
      "Bạn có chắc chắn muốn tạo mã QR để điểm danh? Mã sẽ hết hạn sau 5 phút."
    );
    if (confirm) {
      try {
        // Generate token and set check-in start time
        const token = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}`;
        const now = new Date(); // Current time as check-in start time
        const expires = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now

        // Store token, expiration, and check-in start time in Firebase
        await updateDoc(doc(db, "activities", selectedActivity), {
          qrToken: token,
          qrTokenExpires: expires,
          checkInStartTime: now,
        });

        setQrToken(token);
        setShowQRCode(true);
      } catch (error) {
        console.error("Lỗi tạo mã QR:", error);
        alert("Không thể tạo mã QR. Vui lòng thử lại.");
      }
    }
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById("attendanceQRCode");
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${activityInfo.title}_Attendance_QRCode.png`;
    link.click();
  };

  const getQRCodeUrl = () => {
    if (!activityInfo || !qrToken) return "";
    return `${window.location.origin}/check-in?activityId=${selectedActivity}&token=${qrToken}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
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
                className="px-3 py-2 font-semibold hover:text-blue-500:text-blue-500:text-blue-500"
              >
                Trang chủ
              </a>
            </li>
            <li>
              <a
                href="/manage_activities"
                className="px-3 py-2 font-semibold hover:text-blue-500:text-blue-500:underline"
              >
                Quản lý hoạt động
              </a>
            </li>

            <li>
              <a
                href="/manage_scores"
                className="px-3 py-2 font-semibold hover:text-blue-500:text-blue-500:underline"
              >
                Danh sách đăng ký
              </a>
            </li>
            <li>
              <a
                href="/statistics"
                className="px-3 py-2 font-semibold hover:text-blue-500:text-blue-500:underline"
              >
                Thống kê
              </a>
            </li>
            {/* --- ICON THƯ --- */}
            <li>
              <a
                href="/admin_dashboard"
                title="Tin nhắn" // Thêm title để người dùng biết icon này làm gì
                className="px-3 py-2 font-semibold hover:text-blue-500:text-blue-500:underline"
              >
                {/* SVG cho icon Thư */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
                <span className="sr-only">Tin nhắn</span>{" "}
                {/* Để hỗ trợ screen reader */}
              </a>
            </li>
            {/* --- ICON NGƯỜI DÙNG --- */}
            <li>
              <a
                href="/admin_profile"
                title="Hồ sơ"
                className="px-3 py-2 font-semibold hover:text-blue-500:text-blue-500:underline"
              >
                {/* SVG cho icon Người dùng */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
                <span className="sr-only">Hồ sơ người dùng</span>
              </a>
            </li>
            {/* --- ICON ĐĂNG XUẤT --- */}
            <li>
              <a
                href="/login"
                title="Đăng xuất"
                className="px-3 py-2 bg-indigo-600 rounded font-semibold hover:text-blue-500:text-blue-500:bg-indigo-700 flex items-center"
              >
                {/* SVG cho icon Đăng xuất */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                  />
                </svg>
                <span className="sr-only">Đăng xuất</span>
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-indigo-900 mb-6">
            Danh sách sinh viên đăng ký
          </h2>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedActivity && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  Danh sách sinh viên đã đăng ký ({registrations.length})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={exportToExcel}
                    className="flex items-center gap-2 bg-green-600 hover:text-blue-500:text-blue-500:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    <Download className="w-4 h-4" />
                    Xuất Excel
                  </button>
                  <button
                    onClick={generateQRCode}
                    className="flex items-center gap-2 bg-blue-600 hover:text-blue-500:text-blue-500:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    disabled={!selectedActivity}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v1m0 14v1m-8-8h1m14 0h1m-7-7h1m-2 0h1m-2 14h1m2 0h1m-7-7h1m2 0h1m-7 7h1m2 0h1M7 7h3v3H7V7zm7 0h3v3h-3V7zm-7 7h3v3H7v-3zm7 0h3v3h-3v-3z"
                      />
                    </svg>
                    Tạo QR Code
                  </button>
                </div>
              </div>

              {showQRCode && activityInfo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      QR Code điểm danh cho {activityInfo.title}
                    </h3>
                    <div className="flex justify-center mb-4">
                      <QRCodeCanvas
                        id="attendanceQRCode"
                        value={getQRCodeUrl()}
                        size={200}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-4 text-center">
                      Quét mã này bằng ứng dụng để điểm danh. Mã sẽ hết hạn sau
                      5 phút.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={downloadQRCode}
                        className="flex-1 bg-green-600 hover:text-blue-500:text-blue-500:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                      >
                        Tải QR Code
                      </button>
                      <button
                        onClick={() => setShowQRCode(false)}
                        className="flex-1 bg-indigo-600 hover:text-blue-500:text-blue-500:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Điểm danh
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {registrations.map((registration) => (
                      <tr key={registration.id} className="hover:text-blue-500:text-blue-500:bg-gray-50">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => toggleAttendance(registration.id)}
                            className={`px-3 py-1 rounded-full text-white text-sm font-medium transition ${
                              registration.attendance
                                ? "bg-green-600 hover:text-blue-500:text-blue-500:bg-green-700"
                                : "bg-red-600 hover:text-blue-500:text-blue-500:bg-red-700"
                            }`}
                          >
                            {registration.attendance ? "Bật" : "Tắt"}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {registrations.length === 0 && (
                      <tr>
                        <td
                          colSpan="6"
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

      <footer className="bg-indigo-900 text-white text-center py-4 text-sm">
        © 2025 Công Nghệ Thông Tin - HUIT
      </footer>
    </div>
  );
};

export default ManageRegistrationsPage;

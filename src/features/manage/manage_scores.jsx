"use client";

import { useState, useEffect, useMemo } from "react";
import { auth, db } from "../../services/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  updateDoc,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  Calendar,
  Users,
  Clock,
  // Search, // Đã loại bỏ
  List, // Thêm icon này để thay thế
  Download,
  MessageSquare,
  User,
  LogOut,
  UserCheck,
  UserX,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import * as XLSX from "xlsx";

const ManageRegistrationsPage = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [registrations, setRegistrations] = useState([]); // Danh sách gốc từ Firebase
  const [loading, setLoading] = useState(false);
  const [activityInfo, setActivityInfo] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrToken, setQrToken] = useState("");

  // State cho các bộ lọc
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'checkedIn', 'notCheckedIn'
  // const [searchTerm, setSearchTerm] = useState(""); // ĐÃ LOẠI BỎ

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "/login";
      } else {
        const today = new Date().toISOString().split("T")[0];
        setSelectedDate(today);
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
    } else {
      setRegistrations([]);
      setActivityInfo(null);
    }
  }, [selectedActivity]);

  // Tạo danh sách đã lọc để hiển thị trên bảng
  const filteredRegistrations = useMemo(() => {
    if (statusFilter === "all") {
      return registrations;
    }
    if (statusFilter === "checkedIn") {
      return registrations.filter(
        (reg) => reg.participationStatus === "checkedIn"
      );
    }
    // 'notCheckedIn' sẽ bao gồm cả 'registered' và 'absent'
    return registrations.filter(
      (reg) => reg.participationStatus !== "checkedIn"
    );
  }, [registrations, statusFilter]);

  // LOGIC TÌM KIẾM ĐÃ ĐƯỢC LOẠI BỎ
  // const filteredActivities = useMemo(() => { ... });

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
      const fetchedActivities = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime.toDate(),
      }));
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

      const registrationsQuery = query(
        collection(db, "activity_registrations"),
        where("activityId", "==", activityId),
        orderBy("registerTime", "desc")
      );
      const registrationsSnapshot = await getDocs(registrationsQuery);

      const registrationPromises = registrationsSnapshot.docs.map(
        async (registrationDoc) => {
          const registrationData = registrationDoc.data();
          const userId = registrationData.userId;
          if (!userId) return null;

          const studentRef = doc(db, "students", userId);
          const studentSnap = await getDoc(studentRef);

          let studentInfo = {
            studentId: "Không tìm thấy",
            studentName: `UserID: ${userId}`,
            studentClass: "N/A",
          };
          if (studentSnap.exists()) {
            const studentData = studentSnap.data();
            studentInfo = {
              studentId: studentData.mssv || "N/A",
              studentName: studentData.name || "Không rõ",
              studentClass: studentData.className || "N/A",
            };
          }

          return {
            id: registrationDoc.id,
            ...studentInfo,
            registeredAt: registrationData.registerTime.toDate(),
            participationStatus: registrationData.status || "registered",
          };
        }
      );

      const resolvedRegistrations = (await Promise.all(registrationPromises))
        .filter((reg) => reg !== null)
        .map((reg, index) => ({ ...reg, stt: index + 1 }));

      setRegistrations(resolvedRegistrations);
    } catch (error) {
      console.error("LỖI KHI TẢI DANH SÁCH ĐĂNG KÝ:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = async (registrationId) => {
    const registration = registrations.find((reg) => reg.id === registrationId);
    if (!registration) return;

    const adminUser = auth.currentUser;
    if (!adminUser) {
      alert("Không thể xác định admin. Vui lòng đăng nhập lại.");
      return;
    }

    const isCurrentlyCheckedIn =
      registration.participationStatus === "checkedIn";
    const newStatus = isCurrentlyCheckedIn ? "absent" : "checkedIn";

    if (
      window.confirm(
        isCurrentlyCheckedIn
          ? "Tắt điểm danh cho sinh viên này (chuyển sang Vắng mặt)?"
          : "Bật điểm danh thủ công cho sinh viên này?"
      )
    ) {
      try {
        setLoading(true);
        const updateData = {
          status: newStatus,
          checkInTime: newStatus === "checkedIn" ? Timestamp.now() : null,
          updatedBy: adminUser.email || "admin",
        };
        await updateDoc(
          doc(db, "activity_registrations", registrationId),
          updateData
        );
        await loadRegistrations(selectedActivity);
      } catch (error) {
        console.error("Lỗi khi cập nhật điểm danh:", error);
        alert("Đã xảy ra lỗi. Vui lòng thử lại.");
        setLoading(false);
      }
    }
  };

  const exportToExcel = () => {
    const dataList = filteredRegistrations;
    if (dataList.length === 0) {
      alert("Không có dữ liệu để xuất.");
      return;
    }
    const statusMapping = {
      registered: "Đã đăng ký",
      checkedIn: "Đã điểm danh",
      absent: "Vắng mặt",
    };
    const dataToExport = dataList.map((reg, index) => ({
      STT: index + 1,
      "Mã Sinh Viên": reg.studentId,
      "Tên Sinh Viên": reg.studentName,
      Lớp: reg.studentClass,
      "Thời Gian Đăng Ký": formatDateTime(reg.registeredAt),
      "Trạng Thái":
        statusMapping[reg.participationStatus] || reg.participationStatus,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachDangKy");
    const fileName = `DSDangKy_${
      activityInfo?.title.replace(/[^a-z0-9]/gi, "_") || "HoatDong"
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const formatDateTime = (date) =>
    date && date instanceof Date ? date.toLocaleString("vi-VN") : "";
  const formatTime = (date) =>
    date && date instanceof Date
      ? date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      : "";

  const generateQRCode = async () => {
    // 1. Kiểm tra xem hoạt động đã được chọn chưa
    if (!activityInfo) {
      alert("Vui lòng chọn một hoạt động.");
      return;
    }

    // 2. Kiểm tra thời gian của hoạt động
    const now = new Date();
    const activityStartTime = activityInfo.startTime; // Đây là đối tượng Date từ Firebase

    // Cho phép tạo QR trong khoảng 30 phút trước giờ bắt đầu
    const generationAllowedStart = new Date(
      activityStartTime.getTime() - 30 * 60 * 1000
    );
    // Và kết thúc sau 2 giờ kể từ khi bắt đầu (ví dụ)
    const generationAllowedEnd = new Date(
      activityStartTime.getTime() + 2 * 60 * 60 * 1000
    );

    if (now < generationAllowedStart) {
      alert(
        `Chưa đến thời gian tạo mã QR. Bạn chỉ có thể tạo mã sau ${generationAllowedStart.toLocaleTimeString(
          "vi-VN"
        )}.`
      );
      return;
    }

    if (now > generationAllowedEnd) {
      alert("Hoạt động này đã kết thúc quá lâu để tạo mã QR điểm danh.");
      return;
    }

    // 3. Nếu thời gian hợp lệ, tiếp tục logic cũ
    const confirm = window.confirm(
      "Bạn có chắc chắn muốn tạo mã QR mới? Mã sẽ có hiệu lực trong 5 phút."
    );

    if (confirm) {
      try {
        setLoading(true);
        const token = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}`;
        const expires = new Date(Date.now() + 5 * 60 * 1000); // Hết hạn sau 5 phút

        await updateDoc(doc(db, "activities", selectedActivity), {
          qrToken: token,
          qrTokenExpires: Timestamp.fromDate(expires),
          checkInStartTime: Timestamp.fromDate(new Date()),
        });

        setQrToken(token);
        setShowQRCode(true);
      } catch (error) {
        console.error("Lỗi tạo mã QR:", error);
        alert("Không thể tạo mã QR. Vui lòng thử lại.");
      } finally {
        setLoading(false);
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
                className="px-3 py-2 font-semibold hover:text-blue-500"
              >
                Trang chủ
              </a>
            </li>
            <li>
              <a
                href="/manage_activities"
                className="px-3 py-2 font-semibold hover:text-blue-500"
              >
                Quản lý hoạt động
              </a>
            </li>

            <li>
              <a
                href="/manage_scores"
                className="px-3 py-2 font-semibold hover:text-blue-500"
              >
                Danh sách đăng ký
              </a>
            </li>
            <li>
              <a
                href="/statistics"
                className="px-3 py-2 font-semibold hover:text-blue-500"
              >
                Thống kê
              </a>
            </li>
            {/* --- ICON THƯ --- */}
            <li>
              <a
                href="/admin_dashboard"
                title="Tin nhắn" // Thêm title để người dùng biết icon này làm gì
                className="px-3 py-2 font-semibold hover:text-blue-500"
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
                className="px-3 py-2 font-semibold hover:text-blue-500"
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
                className="px-3 py-2 bg-indigo-600 rounded font-semibold hover:bg-indigo-700 flex items-center"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Chọn ngày
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* PHẦN ĐÃ CHỈNH SỬA */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <List className="inline w-4 h-4 mr-1" />
                  Chọn hoạt động
                </label>
                <select
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={activities.length === 0}
                >
                  <option value="">-- Chọn từ danh sách --</option>
                  {/* Sử dụng trực tiếp 'activities' thay vì 'filteredActivities' */}
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.title} - {formatTime(activity.startTime)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {loading && !selectedActivity && (
              <div className="text-center py-4">
                <div className="inline-flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                  Đang tải...
                </div>
              </div>
            )}
            {activities.length === 0 && selectedDate && !loading && (
              <div className="text-center py-4 text-gray-500">
                Không có hoạt động nào trong ngày.
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
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Danh sách đã đăng ký ({filteredRegistrations.length})
                </h3>

                <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`px-3 py-1 text-sm rounded-md transition ${
                      statusFilter === "all"
                        ? "bg-blue-600 text-white shadow"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Users className="inline w-4 h-4 mr-1" />
                    Tất cả
                  </button>
                  <button
                    onClick={() => setStatusFilter("checkedIn")}
                    className={`px-3 py-1 text-sm rounded-md transition ${
                      statusFilter === "checkedIn"
                        ? "bg-green-600 text-white shadow"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <UserCheck className="inline w-4 h-4 mr-1" />
                    Đã điểm danh
                  </button>
                  <button
                    onClick={() => setStatusFilter("notCheckedIn")}
                    className={`px-3 py-1 text-sm rounded-md transition ${
                      statusFilter === "notCheckedIn"
                        ? "bg-red-600 text-white shadow"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <UserX className="inline w-4 h-4 mr-1" />
                    Chưa điểm danh
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={exportToExcel}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    <Download className="w-4 h-4" /> Xuất Excel
                  </button>
                  <button
                    onClick={generateQRCode}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
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
                      ></path>
                    </svg>
                    Tạo QR Code
                  </button>
                </div>
              </div>

              {showQRCode && activityInfo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  {/* ... QR Code Modal ... */}
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
                        Mã SV
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên SV
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lớp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày giờ ĐK
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Điểm danh
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center p-8 text-gray-500"
                        >
                          Đang tải danh sách...
                        </td>
                      </tr>
                    ) : filteredRegistrations.length > 0 ? (
                      filteredRegistrations.map((registration, index) => {
                        const isCheckedIn =
                          registration.participationStatus === "checkedIn";
                        return (
                          <tr
                            key={registration.id}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {index + 1}
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
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() =>
                                  toggleAttendance(registration.id)
                                }
                                type="button"
                                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                  isCheckedIn ? "bg-green-600" : "bg-gray-300"
                                }`}
                                role="switch"
                                aria-checked={isCheckedIn}
                              >
                                <span className="sr-only">Điểm danh</span>
                                <span
                                  aria-hidden="true"
                                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200 ${
                                    isCheckedIn
                                      ? "translate-x-5"
                                      : "translate-x-0"
                                  }`}
                                />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          {registrations.length === 0
                            ? "Chưa có sinh viên nào đăng ký."
                            : "Không có sinh viên nào phù hợp bộ lọc."}
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

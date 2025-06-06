"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AttendanceManagement = () => {
  const navigate = useNavigate();

  const [activities] = useState([
    {
      id: "1",
      title: "Hội thảo Công nghệ AI",
      date: new Date("2024-01-15"),
      type: "Hội thảo",
    },
    {
      id: "2",
      title: "Workshop React Advanced",
      date: new Date("2024-01-15"),
      type: "Workshop",
    },
    {
      id: "3",
      title: "Seminar Blockchain",
      date: new Date("2024-01-15"),
      type: "Seminar",
    },
  ]);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("all");

  const [attendanceData] = useState({
    1: [
      {
        id: "1-SV001",
        activityId: "1",
        studentId: "SV001",
        studentName: "Nguyễn Văn A",
        status: "Không",
      },
      {
        id: "1-SV002",
        activityId: "1",
        studentId: "SV002",
        studentName: "Trần Thị B",
        status: "Có",
        checkInTime: new Date(),
      },
      {
        id: "1-SV003",
        activityId: "1",
        studentId: "SV003",
        studentName: "Lê Văn C",
        status: "Chờ xử lý",
        checkInTime: new Date(),
      },
    ],
    2: [
      {
        id: "2-SV001",
        activityId: "2",
        studentId: "SV001",
        studentName: "Nguyễn Văn A",
        status: "Có",
        checkInTime: new Date(),
      },
      {
        id: "2-SV004",
        activityId: "2",
        studentId: "SV004",
        studentName: "Phạm Thị D",
        status: "Không",
      },
    ],
    3: [
      {
        id: "3-SV002",
        activityId: "3",
        studentId: "SV002",
        studentName: "Trần Thị B",
        status: "Chờ xử lý",
        checkInTime: new Date(),
      },
      {
        id: "3-SV005",
        activityId: "3",
        studentId: "SV005",
        studentName: "Hoàng Văn E",
        status: "Không",
      },
    ],
  });

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    activityId: "",
    activityTitle: "",
  });

  // Filter activities
  const getFilteredActivities = () => {
    let filtered = activities;

    if (selectedDate) {
      filtered = filtered.filter((activity) => {
        return activity.date.toISOString().split("T")[0] === selectedDate;
      });
    } else {
      const today = new Date();
      filtered = filtered.filter((activity) => {
        return activity.date.toDateString() === today.toDateString();
      });
    }

    if (selectedActivity !== "all") {
      filtered = filtered.filter(
        (activity) => activity.id === selectedActivity
      );
    }

    return filtered;
  };

  // Get activities for dropdown
  const getActivitiesForDropdown = () => {
    let filtered = activities;

    if (selectedDate) {
      filtered = filtered.filter((activity) => {
        return activity.date.toISOString().split("T")[0] === selectedDate;
      });
    } else {
      const today = new Date();
      filtered = filtered.filter((activity) => {
        return activity.date.toDateString() === today.toDateString();
      });
    }

    return filtered;
  };

  const activitiesForDropdown = getActivitiesForDropdown();
  const todayActivities = getFilteredActivities();

  const handleStartAttendance = (activityId, activityTitle) => {
    setConfirmDialog({ open: true, activityId, activityTitle });
  };

  const confirmStartAttendance = () => {
    navigate(`/qr-checkin?activity=${confirmDialog.activityId}`);
    setConfirmDialog({ open: false, activityId: "", activityTitle: "" });
  };

  const updateAttendanceStatus = (recordId, approved) => {
    // Logic cập nhật trạng thái
    console.log(`Update ${recordId} to ${approved ? "Có" : "Không"}`);
  };

  const getStatusBadge = (status) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    switch (status) {
      case "Có":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            ✓ Có
          </span>
        );
      case "Không":
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            ✗ Không
          </span>
        );
      case "Chờ xử lý":
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            ⏳ Chờ xử lý
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            Chưa xác định
          </span>
        );
    }
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setSelectedActivity("all");
  };

  return (
    <div className=" min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex-grow bg-indigo-900 text-white px-6 py-4 flex justify-between flex-wrap items-center">
        <div className="flex items-center gap-3">
          <img src="assets/images/logo.png" alt="Logo" className="w-10 h-10" />
          <h1 className="text-lg font-bold">Công Nghệ Thông Tin</h1>
        </div>
        <nav>
          <ul className="flex flex-wrap gap-3 items-center">
            <li>
              <a
                href="/admin_dashboard"
                className="px-3 py-2 font-semibold hover:text-blue-500 "
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
              <a href="/statistics" className="px-3 py-2 font-semibold ">
                Thống kê
              </a>
            </li>
            <li>
              <a href="/admin_profile" className="px-3 py-2 font-semibold ">
                Tài khoản
              </a>
            </li>
            <li>
              <a
                href="/login"
                className="px-3 py-2 bg-indigo-600 rounded font-semibold hover:text-blue-500:bg-indigo-700"
              >
                Đăng xuất
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              👥 Quản lý điểm danh
            </h2>
            <p className="text-gray-600 mt-1">
              Quản lý điểm danh và xác nhận sinh viên tham gia hoạt động
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="date-filter"
                  className="block text-sm font-medium text-gray-700"
                >
                  Chọn ngày
                </label>
                <input
                  id="date-filter"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500">
                  {selectedDate
                    ? `Hiển thị hoạt động ngày ${new Date(
                        selectedDate
                      ).toLocaleDateString("vi-VN")}`
                    : "Hiển thị hoạt động hôm nay"}
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="activity-select"
                  className="block text-sm font-medium text-gray-700"
                >
                  Chọn hoạt động cụ thể (tùy chọn)
                </label>
                <select
                  id="activity-select"
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả hoạt động</option>
                  {activitiesForDropdown.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.title} - {activity.type}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  Chỉ hiển thị hoạt động của{" "}
                  {selectedDate ? "ngày đã chọn" : "hôm nay"}
                </p>
              </div>
            </div>

            {/* Activities */}
            <div className="space-y-8">
              {todayActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="border border-gray-200 rounded-lg border-l-4 border-l-blue-500"
                >
                  <div className="p-6">
                    {/* Activity Header */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                      <div className="space-y-1">
                        <h3 className="text-xl font-semibold text-blue-900">
                          {activity.title}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          📅 {activity.date.toLocaleDateString("vi-VN")} -{" "}
                          {activity.type}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleStartAttendance(activity.id, activity.title)
                        }
                        className="flex items-center gap-2 bg-green-600 hover:text-blue-500:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
                      >
                        Điểm danh
                      </button>
                    </div>

                    {/* Attendance Table */}
                    <div>
                      <h4 className="font-semibold mb-3">
                        Danh sách điểm danh
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Loại hoạt động
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Mã SV
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Họ tên
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thời gian điểm danh
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trạng thái
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Hành động
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {attendanceData[activity.id]?.map((record) => (
                              <tr key={record.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {activity.type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {record.studentId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {record.studentName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {record.checkInTime ? (
                                    <span>
                                      {record.checkInTime.toLocaleString(
                                        "vi-VN"
                                      )}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">
                                      Chưa điểm danh
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {getStatusBadge(record.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {record.status === "Chờ xử lý" ? (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() =>
                                          updateAttendanceStatus(
                                            record.id,
                                            true
                                          )
                                        }
                                        className="px-3 py-1 text-xs bg-green-100 text-green-800 border border-green-300 rounded hover:text-blue-500:bg-green-200 transition-colors"
                                      >
                                        Duyệt
                                      </button>
                                      <button
                                        onClick={() =>
                                          updateAttendanceStatus(
                                            record.id,
                                            false
                                          )
                                        }
                                        className="px-3 py-1 text-xs bg-red-100 text-red-800 border border-red-300 rounded hover:text-blue-500:bg-red-200 transition-colors"
                                      >
                                        Từ chối
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={record.status === "Có"}
                                        disabled={true}
                                        className="opacity-50 cursor-not-allowed"
                                      />
                                      <span className="ml-2 text-xs text-gray-500">
                                        Đã khóa
                                      </span>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            )) || (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="px-6 py-4 text-center text-gray-500"
                                >
                                  Chưa có sinh viên đăng ký hoạt động này
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {todayActivities.length === 0 && (
                <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-500">
                    Không có hoạt động nào trong ngày hôm nay
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Confirmation Dialog */}
        {confirmDialog.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-2">
                Xác nhận bắt đầu điểm danh
              </h3>
              <p className="text-gray-600 mb-4">
                Bạn muốn bắt đầu điểm danh cho hoạt động "
                {confirmDialog.activityTitle}"?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() =>
                    setConfirmDialog({
                      open: false,
                      activityId: "",
                      activityTitle: "",
                    })
                  }
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:text-blue-500:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmStartAttendance}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:text-blue-500:bg-blue-700 transition-colors"
                >
                  Xác nhận - Bắt đầu điểm danh
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-4 bg-blue-900 text-white mt-10">
        <p className="text-sm">© 2025 Công Nghệ Thông Tin - HUIT</p>
      </footer>
    </div>
  );
};

export default AttendanceManagement;

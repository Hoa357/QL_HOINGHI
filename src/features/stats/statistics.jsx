"use client";

import { useState } from "react";

const Statistics = () => {
  const [selectedYear, setSelectedYear] = useState("");
  const [showTrainingPoints, setShowTrainingPoints] = useState(false);
  const [studentIdFilter, setStudentIdFilter] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("all");

  // Mock data - thay thế bằng Firebase data
  const [yearlyStats, setYearlyStats] = useState({
    2024: {
      khoa: 45,
      doan: 32,
      totalActivities: 77,
      totalParticipants: 1250,
      avgScore: 8.5,
    },
    2025: {
      khoa: 38,
      doan: 28,
      totalActivities: 66,
      totalParticipants: 1100,
      avgScore: 8.7,
    },
  });

  // Dữ liệu điểm rèn luyện chi tiết theo hoạt động
  const [trainingPointsData, setTrainingPointsData] = useState([
    {
      studentId: "SV001",
      studentName: "Nguyễn Văn A",
      year: 2024,
      semester1: {
        activities: [
          {
            name: "Hội thảo AI",
            socialWorkPoints: 5,
            trainingPoints: 3,
            type: "khoa",
          },
          {
            name: "Workshop React",
            socialWorkPoints: 3,
            trainingPoints: 2,
            type: "khoa",
          },
          {
            name: "Hoạt động tình nguyện",
            socialWorkPoints: 7,
            trainingPoints: 4,
            type: "doan",
          },
        ],
        totalSocialWork: 15,
        totalTraining: 9,
      },
      semester2: {
        activities: [
          {
            name: "Seminar Blockchain",
            socialWorkPoints: 4,
            trainingPoints: 3,
            type: "khoa",
          },
          {
            name: "Hội nghị CNTT",
            socialWorkPoints: 6,
            trainingPoints: 4,
            type: "khoa",
          },
          {
            name: "Chiến dịch mùa hè xanh",
            socialWorkPoints: 8,
            trainingPoints: 5,
            type: "doan",
          },
        ],
        totalSocialWork: 18,
        totalTraining: 12,
      },
    },
    {
      studentId: "SV002",
      studentName: "Trần Thị B",
      year: 2024,
      semester1: {
        activities: [
          {
            name: "Hội thảo AI",
            socialWorkPoints: 5,
            trainingPoints: 3,
            type: "khoa",
          },
          {
            name: "Workshop Python",
            socialWorkPoints: 4,
            trainingPoints: 2,
            type: "khoa",
          },
          {
            name: "Hoạt động từ thiện",
            socialWorkPoints: 9,
            trainingPoints: 6,
            type: "doan",
          },
        ],
        totalSocialWork: 18,
        totalTraining: 11,
      },
      semester2: {
        activities: [
          {
            name: "Seminar Data Science",
            socialWorkPoints: 5,
            trainingPoints: 3,
            type: "khoa",
          },
          {
            name: "Tình nguyện mùa thi",
            socialWorkPoints: 6,
            trainingPoints: 4,
            type: "doan",
          },
        ],
        totalSocialWork: 11,
        totalTraining: 7,
      },
    },
  ]);

  // Dữ liệu biểu đồ theo tháng (tách Khoa và Đoàn)
  const [monthlyData] = useState({
    2024: {
      khoa: [3, 5, 4, 6, 4, 2, 2, 3, 5, 6, 4, 5],
      doan: [2, 3, 2, 3, 3, 2, 1, 2, 3, 3, 2, 2],
    },
    2025: {
      khoa: [2, 4, 3, 5, 4, 2, 1, 2, 4, 5, 3, 4],
      doan: [2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2],
    },
  });

  const years = Object.keys(yearlyStats);
  const currentStats = selectedYear ? yearlyStats[selectedYear] : null;

  const filteredTrainingPoints = trainingPointsData.filter((student) => {
    if (
      studentIdFilter &&
      !student.studentId.toLowerCase().includes(studentIdFilter.toLowerCase())
    ) {
      return false;
    }
    if (selectedYear && student.year.toString() !== selectedYear) {
      return false;
    }
    return true;
  });

  const renderTrainingPointsTable = (semester, data) => {
    const semesterName =
      semester === "semester1" ? "Kỳ 1 (Tháng 1-6)" : "Kỳ 2 (Tháng 7-12)";

    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h4 className="text-lg font-semibold mb-4 text-blue-900">
          {semesterName}
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã SV
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên sinh viên
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hoạt động
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Điểm công tác xã hội
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Điểm rèn luyện
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((student) => (
                <>
                  {student[semester].activities.map((activity, actIndex) => (
                    <tr key={`${student.studentId}-${semester}-${actIndex}`}>
                      {actIndex === 0 && (
                        <>
                          <td
                            className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r"
                            rowSpan={student[semester].activities.length + 1}
                          >
                            {student.studentId}
                          </td>
                          <td
                            className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-r"
                            rowSpan={student[semester].activities.length + 1}
                          >
                            {student.studentName}
                          </td>
                        </>
                      )}
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <span>{activity.name}</span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              activity.type === "khoa"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {activity.type === "khoa" ? "Khoa" : "Đoàn"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {activity.socialWorkPoints}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {activity.trainingPoints}
                      </td>
                    </tr>
                  ))}
                  {/* Tổng điểm */}
                  <tr className="bg-blue-50 font-semibold">
                    <td
                      className="px-4 py-3 text-sm text-blue-900 text-right"
                      colSpan={1}
                    >
                      <strong>Tổng điểm:</strong>
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-900 text-center">
                      <strong>{student[semester].totalSocialWork}</strong>
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-900 text-center">
                      <strong>{student[semester].totalTraining}</strong>
                    </td>
                  </tr>
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Kết luận kỳ */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h5 className="font-semibold text-blue-900 mb-3">
            Kết luận {semesterName}:
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded p-3">
              <p className="text-sm text-gray-600">Tổng điểm công tác xã hội</p>
              <p className="text-xl font-bold text-blue-600">
                {data.reduce(
                  (sum, student) => sum + student[semester].totalSocialWork,
                  0
                )}{" "}
                điểm
              </p>
            </div>
            <div className="bg-white rounded p-3">
              <p className="text-sm text-gray-600">Tổng điểm rèn luyện</p>
              <p className="text-xl font-bold text-green-600">
                {data.reduce(
                  (sum, student) => sum + student[semester].totalTraining,
                  0
                )}{" "}
                điểm
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderChart = () => {
    if (!selectedYear || !monthlyData[selectedYear]) return null;

    const khoaData = monthlyData[selectedYear].khoa;
    const doanData = monthlyData[selectedYear].doan;
    const maxValue = Math.max(...khoaData, ...doanData);

    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-6">
          Số hoạt động theo tháng - Năm {selectedYear}
        </h3>
        <div className="flex items-end justify-center space-x-4 h-64">
          {khoaData.map((khoaCount, index) => {
            const doanCount = doanData[index];
            return (
              <div key={index} className="flex flex-col items-center space-y-2">
                {/* Biểu đồ cột */}
                <div className="flex items-end space-x-1 h-48">
                  {/* Cột Khoa */}
                  <div className="flex flex-col items-center">
                    <div className="text-xs font-semibold text-blue-600 mt-1">
                      {khoaCount}
                    </div>
                    <div
                      className="bg-blue-500 rounded-t w-6 transition-all duration-300 hover:bg-blue-600"
                      style={{
                        height: `${(khoaCount / maxValue) * 180}px`,
                        minHeight: khoaCount > 0 ? "8px" : "0px",
                      }}
                    ></div>
                  </div>

                  {/* Cột Đoàn */}
                  <div className="flex flex-col items-center">
                    <div className="text-xs font-semibold text-green-600 mt-1">
                      {doanCount}
                    </div>
                    <div
                      className="bg-green-500 rounded-t w-6 transition-all duration-300 hover:bg-green-600"
                      style={{
                        height: `${(doanCount / maxValue) * 180}px`,
                        minHeight: doanCount > 0 ? "8px" : "0px",
                      }}
                    ></div>
                  </div>
                </div>
                {/* Tháng */}
                <div className="text-xs font-medium text-gray-600">
                  T{index + 1}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Hoạt động Khoa</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Hoạt động Đoàn</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">
            Thống kê tổng quan
          </h2>

          {/* Year Selection */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Chọn năm thống kê</h3>
            <div className="flex gap-4 mb-4">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() =>
                    setSelectedYear(selectedYear === year ? "" : year)
                  }
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    selectedYear === year
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>

            {/* Year Statistics */}
            {currentStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <h4 className="text-lg font-semibold text-blue-900">
                    Hoạt động Khoa
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {currentStats.khoa}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <h4 className="text-lg font-semibold text-green-900">
                    Hoạt động Đoàn
                  </h4>
                  <p className="text-2xl font-bold text-green-600">
                    {currentStats.doan}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <h4 className="text-lg font-semibold text-purple-900">
                    Tổng hoạt động
                  </h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {currentStats.totalActivities}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <h4 className="text-lg font-semibold text-orange-900">
                    Lượt tham gia
                  </h4>
                  <p className="text-2xl font-bold text-orange-600">
                    {currentStats.totalParticipants}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Chart */}
          {selectedYear && renderChart()}

          {/* Training Points Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Điểm rèn luyện</h3>
              <button
                onClick={() => setShowTrainingPoints(!showTrainingPoints)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {showTrainingPoints
                  ? "Ẩn điểm rèn luyện"
                  : "Xem điểm rèn luyện"}
              </button>
            </div>

            {showTrainingPoints && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lọc theo mã sinh viên
                    </label>
                    <input
                      type="text"
                      value={studentIdFilter}
                      onChange={(e) => setStudentIdFilter(e.target.value)}
                      placeholder="Nhập mã sinh viên..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Năm
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Tất cả năm</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kỳ học
                    </label>
                    <select
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Tất cả kỳ</option>
                      <option value="semester1">Kỳ 1 (Tháng 1-6)</option>
                      <option value="semester2">Kỳ 2 (Tháng 7-12)</option>
                    </select>
                  </div>
                </div>

                {/* Training Points Tables */}
                <div className="space-y-6">
                  {selectedYear && (
                    <h4 className="text-lg font-semibold text-gray-900">
                      Điểm rèn luyện năm {selectedYear}
                      {studentIdFilter && ` - Sinh viên: ${studentIdFilter}`}
                    </h4>
                  )}

                  {(selectedSemester === "all" ||
                    selectedSemester === "semester1") &&
                    renderTrainingPointsTable(
                      "semester1",
                      filteredTrainingPoints
                    )}

                  {(selectedSemester === "all" ||
                    selectedSemester === "semester2") &&
                    renderTrainingPointsTable(
                      "semester2",
                      filteredTrainingPoints
                    )}

                  {filteredTrainingPoints.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>
                        Không tìm thấy dữ liệu điểm rèn luyện phù hợp với bộ lọc
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Overall Statistics */}
          {!selectedYear && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <h3 className="text-xl font-semibold text-blue-900 mb-2">
                  Tổng số hoạt động
                </h3>
                <p className="text-3xl font-bold text-gray-800">
                  {Object.values(yearlyStats).reduce(
                    (sum, year) => sum + year.totalActivities,
                    0
                  )}{" "}
                  hoạt động
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <h3 className="text-xl font-semibold text-blue-900 mb-2">
                  Tổng lượt tham gia
                </h3>
                <p className="text-3xl font-bold text-gray-800">
                  {Object.values(yearlyStats).reduce(
                    (sum, year) => sum + year.totalParticipants,
                    0
                  )}{" "}
                  lượt
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <h3 className="text-xl font-semibold text-blue-900 mb-2">
                  Điểm trung bình
                </h3>
                <p className="text-3xl font-bold text-gray-800">
                  {(
                    Object.values(yearlyStats).reduce(
                      (sum, year) => sum + year.avgScore,
                      0
                    ) / Object.values(yearlyStats).length
                  ).toFixed(1)}{" "}
                  điểm
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center py-4 bg-blue-900 text-white mt-10">
        <p className="text-sm">© 2025 Khoa Công Nghệ Thông Tin - HUIT</p>
      </footer>
    </div>
  );
};

export default Statistics;

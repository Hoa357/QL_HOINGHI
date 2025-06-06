"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../services/firebase"; // <-- KIỂM TRA LẠI ĐƯỜNG DẪN NÀY!
import * as XLSX from "xlsx";

// Component con dành riêng cho việc hiển thị Biểu đồ
const MonthlyChart = ({ data }) => {
  if (!data || !data.khoa || !data.doan) {
    return (
      <p className="text-center py-8 text-gray-500">
        Không có dữ liệu biểu đồ cho năm đã chọn.
      </p>
    );
  }

  const khoaData = data.khoa;
  const doanData = data.doan;
  const maxValue = Math.max(1, ...khoaData, ...doanData);

  return (
    <>
      <div className="flex items-end justify-center space-x-4 h-64 overflow-x-auto pb-4">
        {khoaData.map((khoaCount, index) => {
          const doanCount = doanData[index];
          return (
            <div
              key={index}
              className="flex flex-col items-center space-y-2 flex-shrink-0"
            >
              <div className="flex items-end space-x-1 h-48">
                <div
                  className="flex flex-col items-center"
                  title={`Khoa: ${khoaCount} HĐ`}
                >
                  <div className="text-xs font-semibold text-blue-600">
                    {khoaCount}
                  </div>
                  <div
                    className="bg-blue-500 rounded-t w-6 transition-all duration-300 hover:bg-blue-600"
                    style={{
                      height: `${(khoaCount / maxValue) * 180}px`,
                      minHeight: khoaCount > 0 ? "4px" : "0px",
                    }}
                  ></div>
                </div>
                <div
                  className="flex flex-col items-center"
                  title={`Đoàn: ${doanCount} HĐ`}
                >
                  <div className="text-xs font-semibold text-green-600">
                    {doanCount}
                  </div>
                  <div
                    className="bg-green-500 rounded-t w-6 transition-all duration-300 hover:bg-green-600"
                    style={{
                      height: `${(doanCount / maxValue) * 180}px`,
                      minHeight: doanCount > 0 ? "4px" : "0px",
                    }}
                  ></div>
                </div>
              </div>
              <div className="text-xs font-medium text-gray-600">
                T{index + 1}
              </div>
            </div>
          );
        })}
      </div>
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
    </>
  );
};

const Statistics = () => {
  // State chung
  const [students, setStudents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho thống kê năm và biểu đồ
  const [yearlyStatsData, setYearlyStatsData] = useState({});
  const [availableStatYears, setAvailableStatYears] = useState([]);
  const [selectedStatYear, setSelectedStatYear] = useState("");
  const [chartData, setChartData] = useState({});

  // State cho báo cáo sinh viên
  const [selectedClass, setSelectedClass] = useState("all");
  const [allClasses, setAllClasses] = useState([]);

  useEffect(() => {
    const fetchDataAndProcess = async () => {
      setLoading(true);
      try {
        const studentsQuery = query(
          collection(db, "students"),
          where("role", "==", "student")
        );
        const [studentsSnapshot, activitiesSnapshot, attendanceSnapshot] =
          await Promise.all([
            getDocs(studentsQuery),
            getDocs(collection(db, "activities")),
            getDocs(collection(db, "attendance_records")),
          ]);

        const studentsData = studentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const activitiesData = activitiesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const attendanceData = attendanceSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Cập nhật state dữ liệu thô
        setStudents(studentsData);
        setActivities(activitiesData);
        setAttendance(attendanceData);

        // --- XỬ LÝ DỮ LIỆU ---
        const statsByYear = {};
        const monthlyCounts = {};
        const yearsSet = new Set();

        activitiesData.forEach((activity) => {
          if (!activity.startTime || !activity.startTime.toDate) return;
          const activityDate = activity.startTime.toDate();
          const year = activityDate.getFullYear().toString();
          const month = activityDate.getMonth();
          yearsSet.add(year);

          if (!statsByYear[year])
            statsByYear[year] = { khoa: 0, doan: 0, total: 0, attendance: 0 };
          if (!monthlyCounts[year])
            monthlyCounts[year] = {
              khoa: Array(12).fill(0),
              doan: Array(12).fill(0),
            };

          if (activity.activityType === "khoa") {
            statsByYear[year].khoa++;
            monthlyCounts[year].khoa[month]++;
          } else if (activity.activityType === "doan") {
            statsByYear[year].doan++;
            monthlyCounts[year].doan[month]++;
          }
        });

        attendanceData.forEach((record) => {
          const parentActivity = activitiesData.find(
            (act) => act.id === record.activityId
          );
          if (
            parentActivity &&
            parentActivity.startTime &&
            parentActivity.startTime.toDate
          ) {
            const year = parentActivity.startTime
              .toDate()
              .getFullYear()
              .toString();
            if (statsByYear[year]) statsByYear[year].attendance++;
          }
        });

        Object.keys(statsByYear).forEach((year) => {
          statsByYear[year].total =
            statsByYear[year].khoa + statsByYear[year].doan;
        });

        const sortedYears = Array.from(yearsSet).sort((a, b) => b - a);
        setAvailableStatYears(sortedYears);
        setYearlyStatsData(statsByYear);
        setChartData(monthlyCounts);

        const uniqueClasses = [
          ...new Set(studentsData.map((s) => s.className)),
        ];
        setAllClasses(uniqueClasses.sort());

        if (sortedYears.length > 0) {
          setSelectedStatYear(sortedYears[0]);
        }
      } catch (error) {
        console.error("Lỗi khi tải và xử lý dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDataAndProcess();
  }, []);

  const currentYearStats = yearlyStatsData[selectedStatYear] || {
    khoa: 0,
    doan: 0,
    total: 0,
    attendance: 0,
  };

  const processedData = useMemo(() => {
    if (loading) return [];
    const filteredStudents =
      selectedClass === "all"
        ? students
        : students.filter((s) => s.className === selectedClass);
    return filteredStudents.map((student) => {
      const studentAttendance = attendance.filter(
        (att) => att.studentId === student.id
      );
      let totalSocialWorkPoints = 0,
        totalTrainingPoints = 0;
      studentAttendance.forEach((att) => {
        const activity = activities.find((act) => act.id === att.activityId);
        if (activity) {
          totalSocialWorkPoints += Number(activity.socialWorkPoints) || 0;
          totalTrainingPoints += Number(activity.trainingPoints) || 0;
        }
      });
      const socialWorkStatus =
        totalSocialWorkPoints >= 15 ? "Đạt" : "Không đạt";
      const getTrainingRank = (score) => {
        if (score >= 90) return "Xuất sắc";
        if (score >= 80) return "Giỏi";
        if (score >= 65) return "Khá";
        if (score >= 50) return "Trung bình";
        return "Yếu/Kém";
      };
      return {
        mssv: student.manv,
        fullName: student.fullName,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        className: student.className,
        socialWorkStatus: socialWorkStatus,
        trainingRank: getTrainingRank(totalTrainingPoints),
        notes: "",
      };
    });
  }, [students, activities, attendance, selectedClass, loading]);

  const handleExportExcel = () => {
    const dataToExport = processedData.map((item, index) => ({
      STT: index + 1,
      MSSV: item.mssv,
      "HỌ TÊN": item.fullName,
      "GIỚI TÍNH": item.gender,
      "NGÀY SINH": item.dateOfBirth,
      "LỚP HỌC": item.className,
      "ĐIỂM CÔNG TÁC XH": item.socialWorkStatus,
      "ĐIỂM RÈN LUYỆN": item.trainingRank,
      "GHI CHÚ": item.notes,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BaoCaoSinhVien");
    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 15 },
      { wch: 25 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 30 },
    ];
    XLSX.writeFile(
      workbook,
      `BaoCao_${selectedClass === "all" ? "ToanKhoa" : selectedClass}.xlsx`
    );
  };

  const renderHeader = () => (
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
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}
      <main className="max-w-7xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">
          Thống kê tổng quan
        </h2>

        {/* Khu vực Thống kê theo năm */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <h3 className="text-xl font-semibold">Thống kê theo năm</h3>
            {!loading && availableStatYears.length > 0 && (
              <div>
                <label htmlFor="stat-year-select" className="mr-2 font-medium">
                  Chọn năm:
                </label>
                <select
                  id="stat-year-select"
                  value={selectedStatYear}
                  onChange={(e) => setSelectedStatYear(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableStatYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {loading ? (
            <p className="text-center py-8 text-gray-500">
              Đang tải số liệu...
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <h4 className="text-lg font-semibold text-blue-900">
                  Hoạt động Khoa
                </h4>
                <p className="text-4xl font-bold text-blue-600 mt-2">
                  {currentYearStats.khoa}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <h4 className="text-lg font-semibold text-green-900">
                  Hoạt động Đoàn
                </h4>
                <p className="text-4xl font-bold text-green-600 mt-2">
                  {currentYearStats.doan}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <h4 className="text-lg font-semibold text-purple-900">
                  Tổng hoạt động
                </h4>
                <p className="text-4xl font-bold text-purple-600 mt-2">
                  {currentYearStats.total}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <h4 className="text-lg font-semibold text-orange-900">
                  Lượt tham gia
                </h4>
                <p className="text-4xl font-bold text-orange-600 mt-2">
                  {currentYearStats.attendance}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Khu vực Biểu đồ tháng */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold mb-6">
            Số hoạt động theo tháng - Năm {selectedStatYear}
          </h3>
          {loading ? (
            <p className="text-center py-8 text-gray-500">
              Đang tải dữ liệu biểu đồ...
            </p>
          ) : (
            <MonthlyChart data={chartData[selectedStatYear]} />
          )}
        </div>

        {/* Khu vực Báo cáo tổng hợp điểm rèn luyện */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">
            Báo cáo tổng hợp điểm rèn luyện
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo lớp học
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả các lớp</option>
                {allClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-start-3 flex justify-end">
              <button
                onClick={handleExportExcel}
                disabled={loading || processedData.length === 0}
                className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Xuất File Excel
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  {[
                    "STT",
                    "MSSV",
                    "Họ tên",
                    "Giới tính",
                    "Ngày sinh",
                    "Lớp học",
                    "Điểm CTXH",
                    "Điểm rèn luyện",
                    "Ghi chú",
                  ].map((head) => (
                    <th
                      key={head}
                      className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-gray-500">
                      Đang tải dữ liệu báo cáo...
                    </td>
                  </tr>
                ) : processedData.length > 0 ? (
                  processedData.map((item, index) => (
                    <tr key={item.mssv} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {item.mssv}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {item.fullName}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {item.gender}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {item.dateOfBirth}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {item.className}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold">
                        <span
                          className={
                            item.socialWorkStatus === "Đạt"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {item.socialWorkStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-blue-600">
                        {item.trainingRank}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {item.notes}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-gray-500">
                      Không có sinh viên nào trong lớp này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="text-center py-4 bg-indigo-900 text-white mt-10">
        <p className="text-sm">© 2025 Khoa Công Nghệ Thông Tin - HUIT</p>
      </footer>
    </div>
  );
};

export default Statistics;

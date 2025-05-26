import React, { useEffect, useState, useRef } from "react";

import { db, auth } from "../../services/firebase";

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

import Chart from "chart.js/auto";

export default function Statistics() {
  const [totalActivities, setTotalActivities] = useState(0);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [avgScore, setAvgScore] = useState(0);

  const monthlyChartRef = useRef(null);
  const topActivitiesChartRef = useRef(null);
  const monthlyChartInstance = useRef(null);
  const topActivitiesChartInstance = useRef(null);

  useEffect(() => {
    async function loadStatistics() {
      const activitiesCol = collection(db, "activities");
      const studentsCol = collection(db, "students");

      const activitySnapshot = await getDocs(activitiesCol);
      const studentSnapshot = await getDocs(studentsCol);

      setTotalActivities(activitySnapshot.size);

      let totalPart = 0;
      let totalScoreSum = 0;
      studentSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        totalPart += data.participations?.length || 0;
        totalScoreSum += data.score || 0;
      });
      setTotalParticipants(totalPart);
      setAvgScore(
        studentSnapshot.size > 0
          ? (totalScoreSum / studentSnapshot.size).toFixed(2)
          : 0
      );

      // Chuẩn bị dữ liệu cho biểu đồ
      const monthlyCounts = new Array(12).fill(0);
      const activityCounts = [];

      activitySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const date = new Date(data.date);
        const month = date.getMonth();
        monthlyCounts[month]++;
        activityCounts.push({
          title: data.title,
          count: data.registeredStudents?.length || 0,
        });
      });

      const sortedActivities = activityCounts
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Vẽ biểu đồ
      if (monthlyChartInstance.current) monthlyChartInstance.current.destroy();
      monthlyChartInstance.current = new Chart(monthlyChartRef.current, {
        type: "bar",
        data: {
          labels: [
            "Tháng 1",
            "Tháng 2",
            "Tháng 3",
            "Tháng 4",
            "Tháng 5",
            "Tháng 6",
            "Tháng 7",
            "Tháng 8",
            "Tháng 9",
            "Tháng 10",
            "Tháng 11",
            "Tháng 12",
          ],
          datasets: [
            {
              label: "Số hoạt động",
              data: monthlyCounts,
              backgroundColor: "#1a73e8",
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true, stepSize: 1 },
          },
        },
      });

      if (topActivitiesChartInstance.current)
        topActivitiesChartInstance.current.destroy();
      topActivitiesChartInstance.current = new Chart(
        topActivitiesChartRef.current,
        {
          type: "pie",
          data: {
            labels: sortedActivities.map((a) => a.title),
            datasets: [
              {
                label: "Số lượng tham gia",
                data: sortedActivities.map((a) => a.count),
                backgroundColor: [
                  "#42a5f5",
                  "#66bb6a",
                  "#ffa726",
                  "#ab47bc",
                  "#ef5350",
                ],
              },
            ],
          },
          options: {
            responsive: true,
          },
        }
      );
    }

    loadStatistics();

    // Cleanup khi unmount component
    return () => {
      if (monthlyChartInstance.current) monthlyChartInstance.current.destroy();
      if (topActivitiesChartInstance.current)
        topActivitiesChartInstance.current.destroy();
    };
  }, [db]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-900 text-white px-6 py-4 flex justify-between flex-wrap items-center">
        <div className="flex items-center gap-3">
          <img src="assets/images/logo.png" alt="Logo" className="w-10 h-10" />
          <h1 className="text-lg font-bold">Khoa Công Nghệ Thông Tin</h1>
        </div>
        <nav>
          <ul className="flex flex-wrap gap-3 items-center ">
            <li>
              <a
                href="admin_dashboard"
                className="px-3 py-2 font-semibold hover:no-no-no-underline"
              >
                Trang chủ
              </a>
            </li>
            <li>
              <a
                href="manage_activities"
                className="px-3 py-2 font-semibold hover:no-no-no-underline"
              >
                Quản lý hoạt động
              </a>
            </li>
            <li>
              <a
                href="/manage_attendance"
                className="px-3 py-2 font-semibold hover:no-no-no-underline"
              >
                Điểm danh
              </a>
            </li>
            <li>
              <a
                href="manage_scores"
                className="px-3 py-2 font-semibold hover:no-no-no-underline"
              >
                Điểm rèn luyện
              </a>
            </li>
            <li>
              <a
                href="statistics"
                className="px-3 py-2 font-semibold hover:no-no-no-underline"
              >
                Thống kê
              </a>
            </li>
            <li>
              <a
                href="admin_profile"
                className="px-3 py-2 font-semibold hover:no-no-no-underline"
              >
                Tài khoản
              </a>
            </li>
            <li>
              <a
                href="/login"
                className="px-3 py-2 bg-indigo-600 rounded font-semibold"
              >
                Đăng xuất
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <main className="flex-grow">
        <h2 className="text-3xl font-semibold mb-8 text-center text-indigo-900">
          Tổng quan
        </h2>

        <div className="flex flex-wrap gap-6 justify-center mb-12">
          <div className="bg-white shadow rounded-lg p-6 flex-1 min-w-[220px] text-center">
            <h3 className="text-xl font-semibold text-indigo-800 mb-2">
              Tổng số hoạt động
            </h3>
            <p className="text-3xl font-bold text-gray-800">
              {totalActivities} hoạt động
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 flex-1 min-w-[220px] text-center">
            <h3 className="text-xl font-semibold text-indigo-800 mb-2">
              Tổng lượt tham gia
            </h3>
            <p className="text-3xl font-bold text-gray-800">
              {totalParticipants} lượt tham gia
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 flex-1 min-w-[220px] text-center">
            <h3 className="text-xl font-semibold text-indigo-800 mb-2">
              Điểm trung bình
            </h3>
            <p className="text-3xl font-bold text-gray-800">{avgScore} điểm</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-8 justify-center">
          <div className="bg-white rounded-lg shadow p-6 w-full md:w-[48%]">
            <h3 className="text-2xl font-semibold mb-4 text-indigo-800">
              Số hoạt động mỗi tháng
            </h3>
            <canvas ref={monthlyChartRef} />
          </div>

          <div className="bg-white rounded-lg shadow p-6 w-full md:w-[48%]">
            <h3 className="text-2xl font-semibold mb-4 text-indigo-800">
              Top hoạt động có nhiều sinh viên tham gia
            </h3>
            <canvas ref={topActivitiesChartRef} />
          </div>
        </div>
      </main>
      <footer className="text-center text-white bg-[#1a237e] py-4 text-sm mt-6">
        &copy; 2025 Khoa Công Nghệ Thông Tin - HUIT
      </footer>
    </div>
  );
}

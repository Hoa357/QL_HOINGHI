import React, { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const ManageScoresPage = () => {
  const [semester, setSemester] = useState("2024_1");
  const [scores, setScores] = useState([]);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "/login";
      } else {
        loadScores(semester);
      }
    });
  }, []);

  useEffect(() => {
    loadScores(semester);
  }, [semester]);

  const loadScores = async (selectedSemester) => {
    const q = query(
      collection(db, "diemrenluyen"),
      where("hocky", "==", selectedSemester)
    );
    const querySnapshot = await getDocs(q);
    const fetchedScores = [];
    let index = 1;
    querySnapshot.forEach((doc) => {
      fetchedScores.push({ id: doc.id, stt: index++, ...doc.data() });
    });
    setScores(fetchedScores);
  };

  const exportToExcel = () => {
    alert("Chức năng xuất Excel sẽ được cập nhật sau.");
  };

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
                className="px-3 py-2 font-semibold hover:no-underline"
              >
                Trang chủ
              </a>
            </li>
            <li>
              <a
                href="manage_activities"
                className="px-3 py-2 font-semibold hover:no-underline"
              >
                Quản lý hoạt động
              </a>
            </li>
            <li>
              <a
                href="/manage_attendance"
                className="px-3 py-2 font-semibold hover:no-underline"
              >
                Điểm danh
              </a>
            </li>
            <li>
              <a
                href="manage_scores"
                className="px-3 py-2 font-semibold hover:no-underline"
              >
                Điểm rèn luyện
              </a>
            </li>
            <li>
              <a
                href="statistics"
                className="px-3 py-2 font-semibold hover:no-underline"
              >
                Thống kê
              </a>
            </li>
            <li>
              <a
                href="admin_profile"
                className="px-3 py-2 font-semibold hover:no-underline"
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

      {/* Table */}
      <main className="flex-grow overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-4 py-2 text-left">STT</th>
              <th className="px-4 py-2 text-left">Họ tên</th>
              <th className="px-4 py-2 text-left">MSSV</th>
              <th className="px-4 py-2 text-left">Lớp</th>
              <th className="px-4 py-2 text-left">Tổng điểm</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score) => (
              <tr key={score.id} className="border-b hover:bg-gray-100">
                <td className="px-4 py-2">{score.stt}</td>
                <td className="px-4 py-2">{score.hoten}</td>
                <td className="px-4 py-2">{score.mssv}</td>
                <td className="px-4 py-2">{score.lop}</td>
                <td className="px-4 py-2">{score.diem}</td>
              </tr>
            ))}
            {scores.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center px-4 py-4 text-gray-500">
                  Không có dữ liệu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </main>

      {/* Footer */}
      <footer className="bg-indigo-700 text-white text-center py-3 mt-6">
        &copy; 2025 Khoa Công Nghệ Thông Tin - HUIT
      </footer>
    </div>
  );
};

export default ManageScoresPage;

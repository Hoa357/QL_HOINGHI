import React, { useState } from "react";
import { auth, db } from "../../services/firebase";

const ManageActivities = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
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
                className="px-3 py-2 font-semibold hover:underline"
              >
                Trang chủ
              </a>
            </li>
            <li>
              <a
                href="manage_activities"
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
                href="manage_scores"
                className="px-3 py-2 font-semibold hover:underline"
              >
                Điểm rèn luyện
              </a>
            </li>
            <li>
              <a
                href="statistics"
                className="px-3 py-2 font-semibold hover:underline"
              >
                Thống kê
              </a>
            </li>
            <li>
              <a
                href="admin_profile"
                className="px-3 py-2 font-semibold hover:underline"
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

      {/* Main Content */}
      <main className="m-[50px]">
        <h2 className="text-2xl font-semibold text-[#1a237e] mb-6">
          Danh sách hoạt động
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#1a73e8] hover:bg-[#155ab6] text-white px-5 py-2 rounded text-sm font-medium mb-6"
        >
          Thêm hoạt động
        </button>

        {/* Bảng hoạt động */}
        <table className="w-full bg-white rounded shadow-md overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-semibold">Tên hoạt động</th>
              <th className="p-3 text-left font-semibold">Thời gian</th>
              <th className="p-3 text-left font-semibold">Địa điểm</th>
              <th className="p-3 text-left font-semibold">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50 border-b">
              <td className="p-3 text-sm">Hội thảo AI</td>
              <td className="p-3 text-sm">2025-06-15 09:00</td>
              <td className="p-3 text-sm">Hội trường A</td>
              <td className="p-3 text-sm">
                <button className="text-blue-600 hover:underline mr-3">
                  Sửa
                </button>
                <button className="text-red-600 hover:underline">Xóa</button>
              </td>
            </tr>
          </tbody>
        </table>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Thêm hoạt động mới</h3>
              <button
                className="text-gray-600 hover:text-red-500 font-bold text-xl"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>

            <form id="activityForm" className="space-y-4">
              <div>
                <label className="font-medium">Tên hoạt động</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                />
              </div>
              <div>
                <label className="font-medium">Thời gian</label>
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                />
              </div>
              <div>
                <label className="font-medium">Địa điểm</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                />
              </div>
              <div>
                <label className="font-medium">Số lượng</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                />
              </div>
              <div>
                <label className="font-medium">Mô tả</label>
                <textarea className="w-full border border-gray-300 rounded px-3 py-2 mt-1 min-h-[60px]" />
              </div>
              <div className="text-right">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#1a237e] text-white text-center py-4 mt-12 text-sm">
        © 2025 Khoa Công nghệ thông tin. All rights reserved.
      </footer>
    </div>
  );
};

export default ManageActivities;

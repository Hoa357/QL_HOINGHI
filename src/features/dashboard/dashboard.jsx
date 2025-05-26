import React, { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default function AdminDashboard() {
  const [adminName, setAdminName] = useState("Admin");

  // Đăng xuất
  const logout = () => {
    signOut(auth)
      .then(() => {
        window.location.href = "/login";
      })
      .catch((error) => {
        console.error("Lỗi đăng xuất:", error);
      });
  };

  useEffect(() => {
    const db = getFirestore();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "students", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const nhanvienData = docSnap.data();
            setAdminName(nhanvienData.name || user.email);
          } else {
            console.warn("Không tìm thấy thông tin nhân viên trong Firestore.");
            setAdminName(user.email);
          }
        } catch (error) {
          console.error("Lỗi khi lấy tên nhân viên:", error);
          setAdminName(user.email);
        }
      } else {
        // Người dùng chưa đăng nhập
        window.location.href = "/login"; // hoặc trang login
      }
    });

    // Cleanup khi component unmount
    return () => unsubscribe();
  }, []);

  return (
    <>
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
                className="px-3 py-2 font-semibold hover:no-no-underline"
              >
                Trang chủ
              </a>
            </li>
            <li>
              <a
                href="manage_activities"
                className="px-3 py-2 font-semibold hover:no-no-underline"
              >
                Quản lý hoạt động
              </a>
            </li>
            <li>
              <a
                href="manage_attendance.html"
                className="px-3 py-2 font-semibold hover:no-no-underline"
              >
                Điểm danh
              </a>
            </li>
            <li>
              <a
                href="manage_scores"
                className="px-3 py-2 font-semibold hover:no-no-underline"
              >
                Danh sách đăng ký
              </a>
            </li>
            <li>
              <a
                href="statistics"
                className="px-3 py-2 font-semibold hover:no-no-underline"
              >
                Thống kê
              </a>
            </li>
            <li>
              <a
                href="admin_profile"
                className="px-3 py-2 font-semibold hover:no-no-underline"
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

      <main className="flex-1 px-4 max-w-6xl mx-auto mt-8">
        <section className="mb-12">
          <h2 className="text-indigo-900 font-bold text-3xl">
            Chào mừng bạn trở lại,{" "}
            <span id="adminName" className="no-underline">
              {adminName}
            </span>
            !
          </h2>
          <p className="text-gray-600 mt-2 text-lg">
            Hệ thống quản lý hoạt động - Khoa CNTT
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-lg transition duration-300 flex flex-col justify-between min-h-[250px]">
            <h3 className="text-indigo-900 text-xl font-semibold mb-3">
              📅 Quản lý hoạt động
            </h3>
            <p className="text-gray-600 flex-grow mb-4">
              Tạo và chỉnh sửa các hoạt động cho sinh viên.
            </p>
            <a
              href="/manage_activities"
              className="inline-block bg-blue-600 text-white px-5 py-3 rounded hover:bg-blue-700 transition"
            >
              Truy cập
            </a>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-lg transition duration-300 flex flex-col justify-between min-h-[250px]">
            <h3 className="text-indigo-900 text-xl font-semibold mb-3">
              📋 Điểm danh & xác nhận
            </h3>
            <p className="text-gray-600 flex-grow mb-4">
              Quản lý QR và xác nhận sinh viên tham gia.
            </p>
            <a
              href="/manage_attendance"
              className="inline-block bg-blue-600 text-white px-5 py-3 rounded hover:bg-blue-700 transition"
            >
              Truy cập
            </a>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-lg transition duration-300 flex flex-col justify-between min-h-[250px]">
            <h3 className="text-indigo-900 text-xl font-semibold mb-3">
              🎯 Danh sách đăng ký
            </h3>
            <p className="text-gray-600 flex-grow mb-4">
              Xem và cộng/trừ Danh sách đăng ký sinh viên.
            </p>
            <a
              href="/manage_scores"
              className="inline-block bg-blue-600 text-white px-5 py-3 rounded hover:bg-blue-700 transition"
            >
              Truy cập
            </a>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-lg transition duration-300 flex flex-col justify-between min-h-[250px]">
            <h3 className="text-indigo-900 text-xl font-semibold mb-3">
              📊 Thống kê
            </h3>
            <p className="text-gray-600 flex-grow mb-4">
              Thống kê hoạt động, lượt tham gia, điểm số.
            </p>
            <a
              href="/statistics"
              className="inline-block bg-blue-600 text-white px-5 py-3 rounded hover:bg-blue-700 transition"
            >
              Truy cập
            </a>
          </div>
        </section>
      </main>

      <footer className="text-center py-4 bg-indigo-900 text-white select-none mt-16 text-sm">
        &copy; 2025 Khoa Công Nghệ Thông Tin - HUIT
      </footer>
    </>
  );
}

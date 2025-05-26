import React, { useEffect, useState } from "react";
import { auth } from "../../services/firebase";
import {
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default function AdminProfile() {
  const [userEmail, setUserEmail] = useState("");
  const [manv, setManv] = useState("(chưa đặt)");
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState("");

  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email);
        setResetEmail(user.email);

        const docRef = doc(db, "students", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setManv(docSnap.data().manv || "(chưa đặt)");
        } else {
          setManv("(chưa đặt)");
        }
      } else {
        window.location.href = "/login";
      }
    });

    window.addEventListener("pageshow", (event) => {
      if (
        event.persisted ||
        (window.performance && window.performance.navigation.type === 2)
      ) {
        signOut(auth).then(() => {
          window.location.replace("/admin_dashboard");
        });
      }
    });

    return () => unsubscribe();
  }, [db]);

  const sendResetPassword = () => {
    if (!auth.currentUser) {
      setResetStatus("Chưa đăng nhập, vui lòng đăng nhập lại.");
      return;
    }
    if (resetEmail.trim() !== auth.currentUser.email) {
      setResetStatus("Email không trùng với tài khoản đăng nhập.");
      return;
    }

    sendPasswordResetEmail(auth, resetEmail.trim())
      .then(() => {
        setResetStatus("Liên kết đặt lại mật khẩu đã được gửi đến email.");
      })
      .catch((error) => {
        setResetStatus("Lỗi: " + error.message);
      });
  };

  const logout = () => {
    signOut(auth).then(() => {
      window.location.href = "/login";
    });
  };

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
                href="/admin_profile"
                className="px-3 py-2 font-semibold hover:underline"
              >
                Tài khoản
              </a>
            </li>
            <li>
              <button
                onClick={logout}
                className="px-3 py-2 font-semibold hover:bg-white hover:text-indigo-900 rounded transition"
              >
                Đăng xuất
              </button>
            </li>
          </ul>
        </nav>
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto my-10 bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold text-indigo-900 mb-4">
          Thông tin tài khoản
        </h2>
        <div className="text-base space-y-2 mb-6">
          <p>
            <span className="font-semibold">Email:</span> {userEmail || "-"}
          </p>
          <p>
            <span className="font-semibold">Mã nhân viên:</span> {manv}
          </p>
        </div>

        <h3 className="text-xl font-semibold text-indigo-900 mb-2">
          Đổi mật khẩu
        </h3>
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Nhập email để đổi mật khẩu"
            autoComplete="off"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            className="w-full max-w-md border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={sendResetPassword}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
          >
            Gửi liên kết đổi mật khẩu
          </button>
          <p className="text-red-600 min-h-[1.5rem]">{resetStatus}</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 bg-indigo-900 text-white text-sm mt-auto select-none">
        &copy; 2025 Khoa Công Nghệ Thông Tin - HUIT
      </footer>
    </div>
  );
}

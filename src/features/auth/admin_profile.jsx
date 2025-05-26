"use client";

import { useEffect, useState } from "react";
import { auth } from "../../services/firebase";
import {
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import {
  Edit,
  Save,
  X,
  User,
  Calendar,
  Mail,
  BadgeIcon as IdCard,
} from "lucide-react";

export default function AdminProfile() {
  const [userEmail, setUserEmail] = useState("");
  const [userInfo, setUserInfo] = useState({
    manv: "(chưa đặt)",
    fullName: "(chưa đặt)",
    dateOfBirth: "",
    phone: "",
    address: "",
    position: "",
  });
  const [editingInfo, setEditingInfo] = useState({
    fullName: "",
    dateOfBirth: "",
    phone: "",
    address: "",
    position: "",
  });
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("");

  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email);

        const docRef = doc(db, "students", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserInfo({
            manv: data.manv || "(chưa đặt)",
            fullName: data.fullName || "(chưa đặt)",
            dateOfBirth: data.dateOfBirth || "",
            phone: data.phone || "",
            address: data.address || "",
            position: data.position || "",
          });
          setEditingInfo({
            fullName: data.fullName || "",
            dateOfBirth: data.dateOfBirth || "",
            phone: data.phone || "",
            address: data.address || "",
            position: data.position || "",
          });
        } else {
          setUserInfo({
            manv: "(chưa đặt)",
            fullName: "(chưa đặt)",
            dateOfBirth: "",
            phone: "",
            address: "",
            position: "",
          });
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

  const handleEditClick = () => {
    setShowEditForm(true);
    setUpdateStatus("");
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingInfo({
      fullName: userInfo.fullName === "(chưa đặt)" ? "" : userInfo.fullName,
      dateOfBirth: userInfo.dateOfBirth,
      phone: userInfo.phone,
      address: userInfo.address,
      position: userInfo.position,
    });
    setUpdateStatus("");
  };

  const handleSaveInfo = async () => {
    if (!auth.currentUser) {
      setUpdateStatus("Chưa đăng nhập, vui lòng đăng nhập lại.");
      return;
    }

    setIsUpdating(true);
    setUpdateStatus("");

    try {
      const docRef = doc(db, "students", auth.currentUser.uid);
      await updateDoc(docRef, {
        fullName: editingInfo.fullName.trim() || "",
        dateOfBirth: editingInfo.dateOfBirth || "",
        phone: editingInfo.phone.trim() || "",
        address: editingInfo.address.trim() || "",
        position: editingInfo.position.trim() || "",
        updatedAt: new Date(),
      });

      setUserInfo({
        ...userInfo,
        fullName: editingInfo.fullName.trim() || "(chưa đặt)",
        dateOfBirth: editingInfo.dateOfBirth,
        phone: editingInfo.phone.trim(),
        address: editingInfo.address.trim(),
        position: editingInfo.position.trim(),
      });

      setShowEditForm(false);
      setUpdateStatus("Cập nhật thông tin thành công!");
    } catch (error) {
      setUpdateStatus("Lỗi cập nhật: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const logout = () => {
    signOut(auth).then(() => {
      window.location.href = "/login";
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "(chưa đặt)";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
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
                Danh sách đăng ký
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
      <main className="flex-grow flex items-center justify-center py-10 px-4">
        <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-lg">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-indigo-900 mb-2">
              Thông tin tài khoản
            </h2>
          
          </div>

          {/* Thông tin cơ bản */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Thông tin cá nhân
              </h3>
              {!showEditForm && (
                <button
                  onClick={handleEditClick}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  <Edit className="w-4 h-4" />
                  Chỉnh sửa
                </button>
              )}
            </div>

            {!showEditForm ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{userEmail || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <IdCard className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Mã nhân viên</p>
                    <p className="font-medium">{userInfo.manv}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Họ và tên</p>
                    <p className="font-medium">{userInfo.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Ngày sinh</p>
                    <p className="font-medium">
                      {formatDate(userInfo.dateOfBirth)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 text-gray-500 flex items-center justify-center">
                    📞
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <p className="font-medium">
                      {userInfo.phone || "(chưa đặt)"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 text-gray-500 flex items-center justify-center">
                    🏢
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Chức vụ</p>
                    <p className="font-medium">
                      {userInfo.position || "(chưa đặt)"}
                    </p>
                  </div>
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <div className="w-5 h-5 text-gray-500 flex items-center justify-center">
                    📍
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Địa chỉ</p>
                    <p className="font-medium">
                      {userInfo.address || "(chưa đặt)"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email (không thể thay đổi)
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      disabled
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã nhân viên (không thể thay đổi)
                    </label>
                    <input
                      type="text"
                      value={userInfo.manv}
                      disabled
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      value={editingInfo.fullName}
                      onChange={(e) =>
                        setEditingInfo({
                          ...editingInfo,
                          fullName: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      value={editingInfo.dateOfBirth}
                      onChange={(e) =>
                        setEditingInfo({
                          ...editingInfo,
                          dateOfBirth: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={editingInfo.phone}
                      onChange={(e) =>
                        setEditingInfo({
                          ...editingInfo,
                          phone: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chức vụ
                    </label>
                    <input
                      type="text"
                      value={editingInfo.position}
                      onChange={(e) =>
                        setEditingInfo({
                          ...editingInfo,
                          position: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Nhập chức vụ"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      value={editingInfo.address}
                      onChange={(e) =>
                        setEditingInfo({
                          ...editingInfo,
                          address: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Nhập địa chỉ"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    <X className="w-4 h-4" />
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveInfo}
                    disabled={isUpdating}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </div>
            )}

            {updateStatus && (
              <div
                className={`mt-4 p-3 rounded-lg ${
                  updateStatus.includes("thành công")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {updateStatus}
              </div>
            )}
          </div>

          {/* Đổi mật khẩu */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Đổi mật khẩu
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhập email để xác nhận
                </label>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  autoComplete="off"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={sendResetPassword}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                Gửi liên kết đổi mật khẩu
              </button>
              {resetStatus && (
                <div
                  className={`p-3 rounded-lg ${
                    resetStatus.includes("đã được gửi")
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {resetStatus}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 bg-indigo-900 text-white text-sm select-none">
        &copy; 2025 Công Nghệ Thông Tin - HUIT
      </footer>
    </div>
  );
}

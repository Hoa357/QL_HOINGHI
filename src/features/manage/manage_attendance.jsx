import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function ManageAttendance() {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [attendance, setAttendance] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/");
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchActivities = async () => {
      const q = query(collection(db, "activities"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      const acts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setActivities(acts);
    };
    fetchActivities();
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedActivity) return;
      const q = query(
        collection(db, "attendance"),
        where("activityId", "==", selectedActivity)
      );
      const querySnapshot = await getDocs(q);
      const atts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAttendance(atts);
    };
    fetchAttendance();
  }, [selectedActivity]);

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "attendance", id), { status });
      alert(`Đã cập nhật trạng thái: ${status}`);
      setAttendance((prev) =>
        prev.map((att) => (att.id === id ? { ...att, status } : att))
      );
    } catch (err) {
      alert("Lỗi cập nhật trạng thái: " + err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
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

      <main className="max-w-5xl mx-auto bg-white mt-6 p-6 rounded shadow">
        <h2 className="text-2xl font-semibold text-indigo-900 mb-4">
          Quản lý điểm danh và xác nhận sinh viên
        </h2>

        <div className="mb-4">
          <label htmlFor="activitySelect" className="font-semibold mr-3">
            Chọn hoạt động:
          </label>
          <select
            id="activitySelect"
            className="border rounded px-3 py-2"
            value={selectedActivity}
            onChange={(e) => setSelectedActivity(e.target.value)}
          >
            <option value="">-- Chọn hoạt động --</option>
            {activities.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} - {new Date(a.date.seconds * 1000).toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-indigo-700 text-white">
              <th className="p-2 border">MSSV</th>
              <th className="p-2 border">Họ và tên</th>
              <th className="p-2 border">Thời gian điểm danh</th>
              <th className="p-2 border">Trạng thái</th>
              <th className="p-2 border">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {attendance.length > 0 ? (
              attendance.map((att) => (
                <tr key={att.id} className="border">
                  <td className="p-2 border">{att.studentId}</td>
                  <td className="p-2 border">{att.studentName}</td>
                  <td className="p-2 border">
                    {att.timestamp
                      ? new Date(att.timestamp.seconds * 1000).toLocaleString()
                      : "-"}
                  </td>
                  <td className="p-2 border">
                    {att.status || "Chưa xác nhận"}
                  </td>
                  <td className="p-2 border">
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded mr-2"
                      onClick={() => updateStatus(att.id, "Đã xác nhận")}
                    >
                      Xác nhận
                    </button>
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      onClick={() => updateStatus(att.id, "Từ chối")}
                    >
                      Từ chối
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  Chưa có sinh viên điểm danh
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </main>

      <footer className="text-center py-4 bg-indigo-900 text-white mt-10 text-sm select-none">
        &copy; 2025 Khoa Công Nghệ Thông Tin - HUIT
      </footer>
    </div>
  );
}

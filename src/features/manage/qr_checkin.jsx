import React, { useEffect, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { QRCodeCanvas } from "qrcode.react";
import { auth, db } from "../../services/firebase";

export default function QRCheckInPage() {
  const [activityId, setActivityId] = useState("");
  const [qrCodeValue, setQrCodeValue] = useState("");
  const [scanResult, setScanResult] = useState("");
  const [html5QrCode, setHtml5QrCode] = useState(null);

  const handleGenerateQRCode = () => {
    if (activityId.trim() === "") {
      alert("Vui lòng nhập mã hoạt động!");
      return;
    }
    setQrCodeValue(activityId);
  };

  useEffect(() => {
    const qrCodeScanner = new Html5Qrcode("preview");
    setHtml5QrCode(qrCodeScanner);

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          qrCodeScanner.start(
            devices[0].id,
            { fps: 10, qrbox: 250 },
            (decodedText) => {
              setScanResult(`Đã quét: ${decodedText}`);
              qrCodeScanner.stop();
            },
            () => {}
          );
        }
      })
      .catch((err) => console.error(err));

    return () => {
      if (html5QrCode) html5QrCode.stop().catch(() => {});
    };
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex flex-col">
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

      <main className="flex-1 p-6 grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        <section className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold text-[#1a237e] mb-4">
            Tạo mã QR cho hoạt động
          </h2>
          <input
            type="text"
            placeholder="Nhập mã hoạt động (ID)"
            value={activityId}
            onChange={(e) => setActivityId(e.target.value)}
            className="w-full p-3 border rounded mb-4"
          />
          <button
            onClick={handleGenerateQRCode}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Tạo mã QR
          </button>
          <div className="mt-6 flex justify-center">
            {qrCodeValue && <QRCodeCanvas value={qrCodeValue} size={200} />}
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold text-[#1a237e] mb-4">
            Quét mã QR để điểm danh
          </h2>
          <div
            id="preview"
            className="w-full max-w-md mx-auto border rounded"
          />
          <p className="mt-4 text-center text-gray-700">
            {scanResult || "Chưa có dữ liệu quét"}
          </p>
        </section>
      </main>

      <footer className="text-center text-white bg-[#1a237e] py-4 text-sm mt-6">
        &copy; 2025 Khoa Công Nghệ Thông Tin - HUIT
      </footer>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const QRCheckin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activityId = searchParams.get("activity");

  const activities = {
    1: { title: "Hội thảo Công nghệ AI", type: "Hội thảo" },
    2: { title: "Workshop React Advanced", type: "Workshop" },
    3: { title: "Seminar Blockchain", type: "Seminar" },
  };

  const activity = activities[activityId];
  const [qrCreatedAt] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isExpired, setIsExpired] = useState(false);

  const qrData = `attendance:${activityId}:${qrCreatedAt.getTime()}`;
  const expiryTime = new Date(qrCreatedAt.getTime() + 60 * 60 * 1000); // 1 hour

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      if (now.getTime() - qrCreatedAt.getTime() > 60 * 60 * 1000) {
        setIsExpired(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [qrCreatedAt]);

  const remainingTime = Math.max(
    0,
    expiryTime.getTime() - currentTime.getTime()
  );
  const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
  const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-red-500 mb-4">Không tìm thấy hoạt động</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-3 py-1 text-white hover:bg-blue-800 rounded"
          >
            ← Quay lại
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-900 font-bold">HUIT</span>
            </div>
            <h1 className="text-xl font-bold">Điểm danh QR Code</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow">
          <div className="text-center p-6 border-b">
            <h2 className="text-2xl font-bold text-blue-900">
              {activity.title}
            </h2>
            <p className="text-gray-600">{activity.type}</p>
          </div>

          <div className="p-6 text-center space-y-6">
            {/* QR Code or Logo */}
            <div className="flex justify-center">
              <div className="p-6 bg-white rounded-lg shadow-lg border-2 border-blue-200">
                {!isExpired ? (
                  <div className="w-64 h-64 bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <div className="text-6xl mb-2">📱</div>
                      <p className="text-sm text-gray-600">
                        QR Code sẽ hiển thị ở đây
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Data: {qrData}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-64 h-64 bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-2">🏫</div>
                      <p className="text-sm text-gray-600">HUIT Logo</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

       
            {!isExpired ? (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Hướng dẫn điểm danh</h3>
                  <div className="text-left space-y-3 bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        1
                      </span>
                      <span>Sinh viên mở app điểm danh trên điện thoại</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </span>
                      <span>Quét mã QR này bằng camera</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        3
                      </span>
                      <span>Hệ thống sẽ tự động ghi nhận điểm danh</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 text-yellow-800">
                    <span className="text-lg">⏰</span>
                    <span className="font-semibold">
                      Thời gian còn lại: {remainingMinutes}:
                      {remainingSeconds.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <div className="text-sm text-yellow-700 mt-2 space-y-1">
                    <p>
                      • Điểm danh trong 15 phút đầu: <strong>Có mặt</strong>
                    </p>
                    <p>
                      • Điểm danh từ 15-30 phút: <strong>Chờ xử lý</strong>
                    </p>
                    <p>
                      • Sau 30 phút: <strong>Vắng mặt</strong>
                    </p>
                    <p>
                      • Sau 1 giờ: <strong>Mã QR hết hạn</strong>
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 text-red-800">
                    <span className="text-lg">⚠️</span>
                    <span className="font-semibold">Mã QR đã hết hạn</span>
                  </div>
                  <p className="text-sm text-red-700 mt-2">
                    Mã QR đã hết hạn sau 1 giờ. Vui lòng tạo mã QR mới để tiếp
                    tục điểm danh.
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                Quay lại danh sách
              </button>
              <button
                onClick={() => window.location.reload()}
                disabled={!isExpired}
                className={`px-4 py-2 rounded transition-colors ${
                  isExpired
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                📱 {isExpired ? "Tạo mã QR mới" : "Làm mới"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QRCheckin;

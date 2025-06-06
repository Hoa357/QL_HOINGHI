"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router"; // Sử dụng useRouter cho Pages Router
import { auth, db } from "../../services/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";

const CheckInPage = () => {
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { activityId, token } = router.query; // Lấy query parameters từ router.query

  useEffect(() => {
    const checkIn = async () => {
      try {
        // Check if user is logged in
        const user = auth.currentUser;
        if (!user) {
          setMessage("Chưa đăng nhập. Vui lòng đăng nhập để điểm danh.");
          return;
        }
        const studentId = user.uid; // Assume studentId is Firebase UID

        // Validate activity and check-in time
        const activityDoc = await getDoc(doc(db, "activities", activityId));
        if (!activityDoc.exists()) {
          setMessage("Hoạt động không tồn tại.");
          return;
        }
        const { qrToken, qrTokenExpires, checkInStartTime } =
          activityDoc.data();

        // Check token
        if (
          !qrToken ||
          qrToken !== token ||
          new Date(qrTokenExpires.toDate()) < new Date()
        ) {
          setMessage("Mã QR không hợp lệ hoặc đã hết hạn.");
          return;
        }

        // Check if check-in time is within valid window (5 minutes from checkInStartTime)
        const now = new Date();
        const startTime = checkInStartTime ? checkInStartTime.toDate() : null;
        const endTime = startTime
          ? new Date(startTime.getTime() + 5 * 60 * 1000)
          : null;
        if (!startTime || now < startTime || now > endTime) {
          setMessage("Thời gian điểm danh không hợp lệ.");
          return;
        }

        // Check registration and update attendance
        const q = query(
          collection(db, "registrations"),
          where("activityId", "==", activityId),
          where("studentId", "==", studentId)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const registrationDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, "registrations", registrationDoc.id), {
            attendance: true,
            checkInTime: now,
          });
          setMessage("Điểm danh thành công!");
        } else {
          setMessage("Không tìm thấy đăng ký cho sinh viên này.");
        }
      } catch (error) {
        console.error("Lỗi điểm danh:", error);
        setMessage("Không thể điểm danh. Vui lòng thử lại.");
      }
    };

    // Đảm bảo query parameters đã sẵn sàng trước khi gọi checkIn
    if (router.isReady && activityId && token) {
      checkIn();
    } else if (router.isReady) {
      setMessage("Thiếu thông tin hoạt động hoặc token.");
    }
  }, [router.isReady, activityId, token]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Điểm danh</h2>
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
};

export default CheckInPage;

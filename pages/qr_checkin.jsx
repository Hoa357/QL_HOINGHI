// File: app/check-in/page.js (hoặc route tương ứng)
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";

const CheckInContent = () => {
  const [message, setMessage] = useState("Đang xử lý, vui lòng chờ...");
  const [status, setStatus] = useState("loading");

  const searchParams = useSearchParams();
  const activityId = searchParams.get("activityId");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!activityId || !token) {
      setMessage("URL không hợp lệ. Thiếu thông tin hoạt động hoặc token.");
      setStatus("error");
      return;
    }

    const checkIn = async (user) => {
      if (!user) {
        setMessage("Bạn chưa đăng nhập. Vui lòng đăng nhập và quét lại mã QR.");
        setStatus("error");
        return;
      }

      try {
        const activityRef = doc(db, "activities", activityId);
        const activitySnap = await getDoc(activityRef);

        if (!activitySnap.exists()) {
          setMessage("Hoạt động không tồn tại.");
          setStatus("error");
          return;
        }

        const activityData = activitySnap.data();
        const now = new Date();

        if (
          !activityData.qrToken ||
          activityData.qrToken !== token ||
          activityData.qrTokenExpires.toDate() < now
        ) {
          setMessage("Mã QR không hợp lệ hoặc đã hết hạn.");
          setStatus("error");
          return;
        }

        const userId = user.uid;
        const registrationsQuery = query(
          collection(db, "activity_registrations"), // Sửa tên collection
          where("activityId", "==", activityId),
          where("userId", "==", userId) // Sửa tên field
        );

        const querySnapshot = await getDocs(registrationsQuery);

        if (querySnapshot.empty) {
          setMessage("Bạn chưa đăng ký tham gia hoạt động này.");
          setStatus("error");
          return;
        }

        const registrationDoc = querySnapshot.docs[0];

        if (registrationDoc.data().status === "checkedIn") {
          setMessage("Bạn đã điểm danh cho hoạt động này rồi.");
          setStatus("success");
          return;
        }

        await updateDoc(doc(db, "activity_registrations", registrationDoc.id), {
          status: "checkedIn", // Sửa trạng thái
          checkInTime: Timestamp.now(),
        });

        setMessage("Điểm danh thành công! Cảm ơn bạn đã tham gia.");
        setStatus("success");
      } catch (error) {
        console.error("Lỗi điểm danh:", error);
        setMessage(
          "Đã xảy ra lỗi trong quá trình điểm danh. Vui lòng thử lại."
        );
        setStatus("error");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      checkIn(user);
    });

    return () => unsubscribe();
  }, [activityId, token]);

  const getStatusColor = () => {
    if (status === "success") return "text-green-600";
    if (status === "error") return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-xl text-center max-w-md">
        <h1 className="text-2xl font-bold text-indigo-800 mb-4">
          Kết quả Điểm danh
        </h1>
        <p className={`text-lg font-semibold ${getStatusColor()}`}>{message}</p>
        {status !== "loading" && (
          <a
            href="/student_dashboard"
            className="mt-6 inline-block bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition"
          >
            Về Trang chủ
          </a>
        )}
      </div>
    </div>
  );
};

const CheckInPage = () => {
  return (
    <Suspense fallback={<div className="text-center p-6">Đang tải...</div>}>
      <CheckInContent />
    </Suspense>
  );
};

export default CheckInPage;

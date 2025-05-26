import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

const Login = () => {
  const [manv, setManv] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!manv || !password) {
      setErrorMessage("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    try {
      const q = query(collection(db, "students"), where("manv", "==", manv));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setErrorMessage("Mã nhân viên không tồn tại.");
        return;
      }

      const userData = querySnapshot.docs[0].data();
      const email = userData.email;

      await signInWithEmailAndPassword(auth, email, password);

      localStorage.setItem("manv", manv);
      localStorage.setItem("userEmail", email);
      if (userData.name) {
        localStorage.setItem("userName", userData.name);
      }

      navigate("/admin_dashboard");
      // ví dụ route "/admin" là dashboard
    } catch (error) {
      if (error.code === "auth/wrong-password") {
        setErrorMessage("Mật khẩu không đúng.");
      } else if (error.code === "auth/user-not-found") {
        setErrorMessage("Không tìm thấy người dùng.");
      } else if (error.code === "auth/invalid-login-credentials") {
        setErrorMessage("Email hoặc mật khẩu không đúng.");
      } else {
        setErrorMessage("Lỗi đăng nhập: " + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-center text-2xl font-bold text-indigo-900 mb-6">
          Đăng nhập hệ thống
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="manv"
              className="block mb-1 text-gray-700 font-semibold"
            >
              Mã nhân viên
            </label>
            <input
              type="text"
              id="manv"
              value={manv}
              onChange={(e) => setManv(e.target.value)}
              placeholder="Nhập mã nhân viên"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-base focus:outline-none focus:border-indigo-700 transition"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-1 text-gray-700 font-semibold"
            >
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-base focus:outline-none focus:border-indigo-700 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-md text-lg font-semibold hover:bg-indigo-700 transition"
          >
            Đăng nhập
          </button>

          <p className="text-red-600 text-center mt-3 min-h-[1.5rem]">
            {errorMessage}
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;

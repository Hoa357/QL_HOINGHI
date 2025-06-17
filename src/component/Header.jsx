import React from "react";

const Header = () => {
  return (
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
              className="px-3 py-2 font-semibold hover:text-blue-500"
            >
              Trang chủ
            </a>
          </li>
          <li>
            <a
              href="/manage_activities"
              className="px-3 py-2 font-semibold hover:text-blue-500"
            >
              Quản lý hoạt động
            </a>
          </li>
          <li>
            <a
              href="/manage_scores"
              className="px-3 py-2 font-semibold hover:text-blue-500"
            >
              Danh sách đăng ký
            </a>
          </li>
          <li>
            <a
              href="/statistics"
              className="px-3 py-2 font-semibold hover:text-blue-500"
            >
              Thống kê
            </a>
          </li>
          <li>
            <a
              href="/admin_dashboard"
              title="Tin nhắn"
              className="px-3 py-2 font-semibold hover:text-blue-500"
            >
              {/* Tin nhắn icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                />
              </svg>
              <span className="sr-only">Tin nhắn</span>
            </a>
          </li>
          <li>
            <a
              href="/admin_profile"
              title="Hồ sơ"
              className="px-3 py-2 font-semibold hover:text-blue-500"
            >
              {/* Hồ sơ icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
              <span className="sr-only">Hồ sơ người dùng</span>
            </a>
          </li>
          <li>
            <a
              href="/login"
              title="Đăng xuất"
              className="px-3 py-2 bg-indigo-600 rounded font-semibold hover:bg-indigo-700 flex items-center"
            >
              {/* Đăng xuất icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                />
              </svg>
              <span className="sr-only">Đăng xuất</span>
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;

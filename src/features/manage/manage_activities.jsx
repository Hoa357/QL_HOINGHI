"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import toast from "react-hot-toast";
import { storage } from "../../services/firebase"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Calendar,
  Clock,
  ImageIcon,
  UserPlus,
  X,
  ChevronDown,
  Loader2,
  MapPin,
  Eye,
} from "lucide-react";
import Header from "../../component/Header";

const ManageActivities = () => {
  const [user] = useAuthState(auth);
  const [activities, setActivities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [viewingActivity, setViewingActivity] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);


  const [filterStatus, setFilterStatus] = useState("all"); 


  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestPosition, setNewGuestPosition] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    activityType: "khoa", 
    startTime: "",
    registrationDeadline: "", 
    location: "",
    maxParticipants: "",
    trainingPoints: "",
    socialWorkPoints: "",
    guests: [], 
    status: true,
    images: [],
  });

  // Load activities từ Firebase
  const loadActivities = async () => {
    try {
      setIsLoadingActivities(true);
      const q = query(
        collection(db, "activities"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      const activitiesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        startTime:
          doc.data().startTime?.toDate?.()?.toISOString?.()?.slice(0, 16) ||
          doc.data().startTime,
        registrationDeadline:
          doc
            .data()
            .registrationDeadline?.toDate?.()
            ?.toISOString?.()
            ?.slice(0, 16) || doc.data().registrationDeadline,
      }));

      setActivities(activitiesData);
    } catch (error) {
      console.error("Lỗi tải hoạt động:", error);
      toast.error("Không thể tải danh sách hoạt động");
    } finally {
      setIsLoadingActivities(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadActivities();
    }
  }, [user]);

  
  const isRegistrationExpired = (deadline) => {
    if (!deadline) return false;
    const deadlineDate =
      typeof deadline === "string" ? new Date(deadline) : deadline;
    return new Date() > deadlineDate;
  };

 
  const filteredActivities = useMemo(() => {
    if (filterStatus === "active") {
      // Lọc ra các hoạt động chưa hết hạn đăng ký
      return activities.filter(
        (activity) => !isRegistrationExpired(activity.registrationDeadline)
      );
    }
    if (filterStatus === "expired") {
      // Lọc ra các hoạt động đã hết hạn đăng ký
      return activities.filter((activity) =>
        isRegistrationExpired(activity.registrationDeadline)
      );
    }
   
    return activities;
  }, [activities, filterStatus]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      activityType: "khoa",
      startTime: "",
      registrationDeadline: "",
      location: "",
      maxParticipants: "",
      trainingPoints: "",
      socialWorkPoints: "",
      guests: [],
      status: true,
      images: [],
    });
    setEditingActivity(null);
    setViewingActivity(null);
    setNewGuestName("");
    setNewGuestPosition("");
  };

  const openModal = (activityType) => {
    resetForm();
    setFormData((prev) => ({ ...prev, activityType }));
    setShowModal(true);
    setShowDropdown(false);
  };

  // Thêm khách mời
  const addNewGuest = () => {
    if (newGuestName.trim() && newGuestPosition.trim()) {
      const newGuest = {
        name: newGuestName.trim(),
        position: newGuestPosition.trim(),
      };
      setFormData((prev) => ({
        ...prev,
        guests: [...prev.guests, newGuest],
      }));
      setNewGuestName("");
      setNewGuestPosition("");
    }
  };

  // Xóa khách mời
  const removeGuest = (index) => {
    setFormData((prev) => ({
      ...prev,
      guests: prev.guests.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Bạn cần đăng nhập để thực hiện thao tác này");
      return;
    }

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.startTime ||
      !formData.registrationDeadline
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    const startTime = new Date(formData.startTime);
    const deadlineTime = new Date(formData.registrationDeadline);

    if (startTime <= deadlineTime) {
      toast.error(
        "Thời gian bắt đầu hoạt động phải sau thời gian hết hạn đăng ký!"
      );
      return; 
    }

    setIsSubmitting(true);
    const toastId = toast.loading(
      editingActivity ? "Đang cập nhật..." : "Đang tạo mới..."
    );

    try {
      // --- BƯỚC A: TẢI ẢNH LÊN FIREBASE STORAGE ---
      const imageUrls = [];
      if (formData.images.length > 0) {
        toast.loading("Đang tải hình ảnh...", { id: toastId });

        const uploadPromises = formData.images.map((file) => {
          const uniqueFileName = `${uuidv4()}-${file.name}`;
          const imageRef = ref(storage, `activity_images/${uniqueFileName}`);
          return uploadBytes(imageRef, file).then((snapshot) =>
            getDownloadURL(snapshot.ref)
          );
        });

        const resolvedImageUrls = await Promise.all(uploadPromises);
        imageUrls.push(...resolvedImageUrls);

        toast.loading("Đang lưu thông tin hoạt động...", { id: toastId });
      }

      // --- BƯỚC B: CHUẨN BỊ VÀ LƯU DỮ LIỆU VÀO FIRESTORE ---
      const activityData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        activityType: formData.activityType,
        startTime: new Date(formData.startTime),
        registrationDeadline: new Date(formData.registrationDeadline),
        location: formData.location.trim(),
        maxParticipants: Number.parseInt(formData.maxParticipants) || 0,
        trainingPoints: Number.parseInt(formData.trainingPoints) || 0,
        socialWorkPoints: Number.parseInt(formData.socialWorkPoints) || 0,
        guests: formData.guests,
        status: formData.status,
     
        images: imageUrls,
        ...(editingActivity
          ? { updatedAt: serverTimestamp() }
          : {
              createdAt: serverTimestamp(),
              createdBy: user.uid,
              currentRegistrations: 0,
            }),
      };

      if (editingActivity) {
     
        await updateDoc(
          doc(db, "activities", editingActivity.id),
          activityData
        );
        toast.success("Cập nhật hoạt động thành công!", { id: toastId });
      } else {
        await addDoc(collection(db, "activities"), activityData);
        toast.success("Tạo hoạt động mới thành công!", { id: toastId });
      }

      await loadActivities();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Lỗi khi lưu hoạt động:", error);
      toast.error(`Có lỗi xảy ra: ${error.message}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setViewingActivity(null);
    setFormData({
      title: activity.title,
      description: activity.description,
      activityType: activity.activityType,
      startTime: activity.startTime,
      registrationDeadline: activity.registrationDeadline,
      location: activity.location,
      maxParticipants: activity.maxParticipants.toString(),
      trainingPoints: activity.trainingPoints.toString(),
      socialWorkPoints: activity.socialWorkPoints.toString(),
      guests: activity.guests || [],
      status: activity.status,
      images: [],
    });
    setShowModal(true);
  };


  const handleView = (activity) => {
    setViewingActivity(activity);
    setEditingActivity(null);
    setFormData({
      title: activity.title,
      description: activity.description,
      activityType: activity.activityType,
      startTime: activity.startTime,
      registrationDeadline: activity.registrationDeadline,
      location: activity.location,
      maxParticipants: activity.maxParticipants.toString(),
      trainingPoints: activity.trainingPoints.toString(),
      socialWorkPoints: activity.socialWorkPoints.toString(),
      guests: activity.guests || [],
      status: activity.status,
      images: [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const activity = activities.find((a) => a.id === id);
    const isExpired = isRegistrationExpired(activity?.registrationDeadline);

    const confirmMessage = isExpired
      ? `Bạn có chắc chắn muốn xóa hoạt động "${activity?.title}" không?\nHoạt động này đã hết hạn đăng ký.`
      : `Bạn có chắc chắn muốn xóa hoạt động "${activity?.title}" không?\n\ Hành động này không thể hoàn tác!`;

    if (!window.confirm(confirmMessage)) return;

    try {
      await deleteDoc(doc(db, "activities", id));
      toast.success("Xóa hoạt động thành công!");
      await loadActivities();
    } catch (error) {
      console.error("Lỗi xóa hoạt động:", error);
      toast.error("Có lỗi xảy ra khi xóa hoạt động");
    }
  };

  const toggleActivityStatus = async (id, currentStatus) => {
    const activity = activities.find((a) => a.id === id);
    const isExpired = isRegistrationExpired(activity?.registrationDeadline);

    if (isExpired) {
      toast.error(
        "Không thể thay đổi trạng thái của hoạt động đã hết hạn đăng ký!"
      );
      return;
    }

    try {
      await updateDoc(doc(db, "activities", id), {
        status: !currentStatus,
        updatedAt: serverTimestamp(),
      });
      toast.success("Cập nhật trạng thái thành công!");
      await loadActivities();
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "";
    const date = typeof dateTime === "string" ? new Date(dateTime) : dateTime;
    return date.toLocaleString("vi-VN");
  };


  const ActivityTypeLogo = ({ type }) => {
    if (type === "khoa") {
      return (
        <img
          src="assets/images/logo.png"
          alt="Logo Khoa"
          className="w-12 h-12 rounded-full"
        />
      );
    } else {
      return (
        <img
          src="assets/images/Doan.png"
          alt="Logo Đoàn"
          className="w-12 h-12 rounded-full"
        />
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="m-[20px]">
        <h2 className="text-2xl font-semibold text-[#1a237e] mb-6">
          Danh sách hoạt động
        </h2>

      
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          {/* Dropdown Button "Thêm hoạt động" */}
          <div className="relative inline-block">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="bg-[#1a73e8] hover:bg-[#155ab6] text-white px-5 py-2 rounded text-sm font-medium flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Thêm hoạt động
              <ChevronDown className="h-4 w-4" />
            </button>
            {showDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-[200px]">
                <button
                  onClick={() => openModal("khoa")}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-3"
                >
                  <img
                    src="assets/images/logo.png"
                    alt="Logo Khoa"
                    className="w-6 h-6 rounded-full"
                  />
                  Hoạt động Khoa
                </button>
                <button
                  onClick={() => openModal("truong")}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-3 border-t"
                >
                  <img
                    src="assets/images/Doan.png"
                    alt="Logo Đoàn"
                    className="w-6 h-6 rounded-full"
                  />
                  Hoạt động Đoàn
                </button>
              </div>
            )}
          </div>

          {/* THÊM MỚI: Nhóm nút lọc */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1 bg-white">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1 text-sm rounded-md transition ${
                filterStatus === "all"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-3 py-1 text-sm rounded-md transition ${
                filterStatus === "active"
                  ? "bg-green-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Còn hạn ĐK
            </button>
            <button
              onClick={() => setFilterStatus("expired")}
              className={`px-3 py-1 text-sm rounded-md transition ${
                filterStatus === "expired"
                  ? "bg-red-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Hết hạn ĐK
            </button>
          </div>
        </div>

        {/* Activities Table */}
        {isLoadingActivities ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Đang tải danh sách hoạt động...</p>
          </div>
        ) : (
          <div className="bg-white rounded shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left font-semibold">Loại</th>
                    <th className="p-3 text-left font-semibold">Tiêu đề</th>
                    <th className="p-3 text-left font-semibold">
                      Thời gian tổ chức
                    </th>
                    <th className="p-3 text-left font-semibold">
                      Kết thúc đăng ký
                    </th>
                    <th className="p-3 text-left font-semibold">Địa điểm</th>
                    <th className="p-3 text-left font-semibold">
                      Số lượng tối đa
                    </th>
                    <th className="p-3 text-left font-semibold">
                      Điểm rèn luyện
                    </th>
                    <th className="p-3 text-left font-semibold">Điểm CTXH</th>
                    <th className="p-3 text-left font-semibold">Trạng thái</th>
                    <th className="p-3 text-left font-semibold">Ảnh</th>
                    <th className="p-3 text-left font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                 
                  {filteredActivities.map((activity) => {
                    const isExpired = isRegistrationExpired(
                      activity.registrationDeadline
                    );
                    return (
                      <tr
                        key={activity.id}
                        className={`hover:bg-gray-50 border-b ${
                          isExpired
                            ? "bg-gray-200" 
                            : activity.activityType === "khoa"
                            ? "bg-blue-50"
                            : ""
                        }`}
                      >
                        <td className="p-3 text-center">
                          <ActivityTypeLogo type={activity.activityType} />
                        </td>
                        <td className="p-3 text-sm font-medium max-w-48">
                          <div className="truncate" title={activity.title}>
                            {activity.title}
                          </div>
                        </td>
                        <td className="p-3 text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                            {formatDateTime(activity.startTime)}
                          </div>
                        </td>
                        <td className="p-3 text-sm">
                          <div
                            className={`flex items-center ${
                              isExpired ? "text-red-600 font-medium" : ""
                            }`}
                          >
                            <Clock className="h-4 w-4 mr-1 text-gray-500" />
                            {formatDateTime(activity.registrationDeadline)}
                            {isExpired && (
                              <span className="ml-1 text-xs">(Hết hạn)</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-sm">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                            {activity.location}
                          </div>
                        </td>
                        <td className="p-3 text-sm">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-gray-500" />
                            {activity.maxParticipants}
                          </div>
                        </td>
                        <td className="p-3 text-sm">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            {activity.trainingPoints} điểm
                          </span>
                        </td>
                        <td className="p-3 text-sm">
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                            {activity.socialWorkPoints} điểm
                          </span>
                        </td>
                        <td className="p-3 text-sm">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={activity.status && !isExpired}
                              onChange={() =>
                                !isExpired &&
                                toggleActivityStatus(
                                  activity.id,
                                  activity.status
                                )
                              }
                              className="sr-only"
                              disabled={isExpired}
                            />
                            <div
                              className={`relative w-10 h-6 rounded-full transition-colors ${
                                activity.status && !isExpired
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              } ${
                                isExpired ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                            >
                              <div
                                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                  activity.status && !isExpired
                                    ? "translate-x-4"
                                    : "translate-x-0"
                                }`}
                              />
                            </div>
                          </label>
                        </td>
                        <td className="p-3 text-sm">
                          <div className="flex items-center">
                            <ImageIcon className="h-4 w-4 mr-1 text-gray-500" />
                            <span>{activity.images?.length || 0}</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleView(activity)}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => !isExpired && handleEdit(activity)}
                              className={`p-1 ${
                                isExpired
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-blue-600 hover:text-blue-800"
                              }`}
                              title={
                                isExpired
                                  ? "Không thể sửa (hết hạn đăng ký)"
                                  : "Sửa"
                              }
                              disabled={isExpired}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(activity.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* CẬP NHẬT: Thông báo khi không có dữ liệu */}
            {activities.length === 0 && !isLoadingActivities && (
              <div className="text-center py-8 text-gray-500">
                Chưa có hoạt động nào. Nhấn "Thêm hoạt động" để bắt đầu.
              </div>
            )}
            {activities.length > 0 && filteredActivities.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Không có hoạt động nào phù hợp với bộ lọc đã chọn.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {viewingActivity
                    ? "Chi tiết hoạt động"
                    : editingActivity
                    ? "Chỉnh sửa hoạt động"
                    : "Thêm hoạt động mới"}{" "}
                  -{" "}
                  {formData.activityType === "khoa"
                    ? "Hoạt động Khoa"
                    : "Hoạt động Đoàn"}
                </h3>
                <button
                  className="text-gray-600 hover:text-red-500 font-bold text-xl"
                  onClick={() => setShowModal(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {viewingActivity ? (
                //Chỉ hiển thị thông tin
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-small mb-1">Tiêu đề</label>
                      <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50">
                        {formData.title}
                      </div>
                    </div>
                    <div>
                      <label className="block font-small mb-1">
                        Số lượng tối đa
                      </label>
                      <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50">
                        {formData.maxParticipants}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-small mb-1">Mô tả</label>
                    <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 min-h-[80px]">
                      {formData.description}
                    </div>
                  </div>
                
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                    {/* Thời gian bắt đầu */}
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <label className="flex items-center text-sm font-semibold text-green-800 mb-1">
                        <Calendar className="w-4 h-4 mr-2" />
                        Thời gian diễn ra
                      </label>
                      <p className="text-gray-800 font-medium pl-6">
                        {formatDateTime(formData.startTime)}
                      </p>
                    </div>

                    {/* Hạn đăng ký */}
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <label className="flex items-center text-sm font-semibold text-orange-800 mb-1">
                        <Clock className="w-4 h-4 mr-2" />
                        Hạn chót đăng ký
                      </label>
                      <p className="text-gray-800 font-medium pl-6">
                        {formatDateTime(formData.registrationDeadline)}
                      </p>
                      {/* Thêm cảnh báo nếu đã hết hạn */}
                      {isRegistrationExpired(formData.registrationDeadline) && (
                        <p className="text-red-600 text-xs font-semibold mt-1 pl-6">
                          (Đã hết hạn đăng ký)
                        </p>
                      )}
                    </div>

                    {/* Địa điểm */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 lg:col-span-1 md:col-span-2">
                      <label className="flex items-center text-sm font-semibold text-blue-800 mb-1">
                        <MapPin className="w-4 h-4 mr-2" />
                        Địa điểm
                      </label>
                      <p className="text-gray-800 font-medium pl-6">
                        {formData.location || "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-small mb-1">
                        Điểm rèn luyện
                      </label>
                      <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50">
                        {formData.trainingPoints} điểm
                      </div>
                    </div>
                    <div>
                      <label className="block font-small mb-1">
                        Điểm công tác xã hội
                      </label>
                      <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50">
                        {formData.socialWorkPoints} điểm
                      </div>
                    </div>
                  </div>

                  {formData.guests.length > 0 && (
                    <div>
                      <label className="block font-small mb-2">
                        Khách mời ({formData.guests.length})
                      </label>
                      <div className="space-y-1">
                        {formData.guests.map((guest, index) => (
                          <div
                            key={index}
                            className="bg-gray-100 px-3 py-2 rounded"
                          >
                            <span className="text-sm">
                              {guest.name} - {guest.position}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              ) : (
                // - Form có thể chỉnh sửa
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-1">Tiêu đề</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="Nhập tiêu đề hoạt động"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-1">
                        Số lượng tối đa
                      </label>
                      <input
                        type="number"
                        value={formData.maxParticipants}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            maxParticipants: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="Số người tham gia tối đa"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium mb-1">Mô tả </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 min-h-[80px]"
                      placeholder="Mô tả chi tiết về hoạt động"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-medium mb-1">
                        Thời gian bắt đầu
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.startTime}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            startTime: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-1">
                        Hạn đăng ký
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.registrationDeadline}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            registrationDeadline: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-1">Địa điểm</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="Địa điểm tổ chức"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-1">
                        Điểm rèn luyện
                      </label>
                      <input
                        type="number"
                        value={formData.trainingPoints}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            trainingPoints: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="Số điểm rèn luyện"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-1">
                        Điểm công tác xã hội
                      </label>
                      <input
                        type="number"
                        value={formData.socialWorkPoints}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            socialWorkPoints: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="Số điểm công tác xã hội"
                        required
                      />
                    </div>
                  </div>

                  {/* Khách mời */}
                  <div>
                    <label className="block font-medium mb-2">Khách mời</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                      <input
                        type="text"
                        value={newGuestName}
                        onChange={(e) => setNewGuestName(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2"
                        placeholder="Tên khách mời"
                      />
                      <input
                        type="text"
                        value={newGuestPosition}
                        onChange={(e) => setNewGuestPosition(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2"
                        placeholder="Chức vụ"
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addNewGuest())
                        }
                      />
                      <button
                        type="button"
                        onClick={addNewGuest}
                        disabled={
                          !newGuestName.trim() || !newGuestPosition.trim()
                        }
                        className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Thêm
                      </button>
                    </div>

                    {formData.guests.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          Danh sách khách mời ({formData.guests.length}):
                        </p>
                        <div className="space-y-1">
                          {formData.guests.map((guest, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded"
                            >
                              <span className="text-sm">
                                {guest.name} - {guest.position}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeGuest(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium mb-1">Hình ảnh</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    {formData.images.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {formData.images.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded"
                          >
                            <span className="text-sm">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {editingActivity ? "Đang cập nhật..." : "Đang tạo..."}
                        </>
                      ) : editingActivity ? (
                        "Cập nhật"
                      ) : (
                        "Lưu"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#1a237e] text-white text-center py-4 mt-12 text-sm">
        © 2025 Công Nghệ Thông Tin. All rights reserved.
      </footer>
    </div>
  );
};

export default ManageActivities;

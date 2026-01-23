import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useMemberActions } from "../hooks/useMember";
import { memberApi } from "../apis/member";
import type { InvitationDetails } from "../types/projectMember";

// Type riêng cho response API (backend không trả projectId)
interface InvitationResponse {
  projectName: string;
  inviterName: string;
  role: InvitationDetails["role"];
  expiresAt: string;
}

export default function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { acceptInvitation, isLoading: accepting } = useMemberActions();

  const [invitationDetails, setInvitationDetails] = useState<InvitationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);

  const token = searchParams.get("token");

  // Step 1: Load invitation details (public, no auth required)
  useEffect(() => {
    if (!token) {
      setError("Liên kết lời mời không hợp lệ");
      setLoadingDetails(false);
      return;
    }

    const loadInvitationDetails = async () => {
      try {
        const response = await memberApi.getInvitationDetails(token);
        setInvitationDetails(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Không thể tải thông tin lời mời");
      } finally {
        setLoadingDetails(false);
      }
    };

    loadInvitationDetails();
  }, [token]);

  // Step 2: Handle authentication & auto-accept
  useEffect(() => {
    if (authLoading || loadingDetails) return;

    if (!isAuthenticated) {
      // Chưa login → lưu token và redirect về login
      if (token) {
        localStorage.setItem("pendingInvitation", token);
      }
      navigate("/login", {
        state: { from: `/accept-invitation?token=${token}` },
      });
      return;
    }

    // Đã login → tự động accept nếu có token
    if (token) {
      handleAccept();
    }
  }, [isAuthenticated, authLoading, loadingDetails, token, navigate]);

  const handleAccept = async () => {
    if (!token) return;

    try {
      // Gọi acceptInvitation chỉ với token (1 tham số)
      await acceptInvitation(token);
      localStorage.removeItem("pendingInvitation");
      navigate("/projects", {
        state: { message: "Bạn đã tham gia dự án thành công!" },
      });
    } catch (err: any) {
      setError(err.message || "Không thể chấp nhận lời mời");
    }
  };

  // Loading state
  if (authLoading || loadingDetails || accepting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loadingDetails && "Đang tải thông tin lời mời..."}
            {authLoading && "Đang kiểm tra đăng nhập..."}
            {accepting && "Đang chấp nhận lời mời..."}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi lời mời</h3>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => navigate("/projects")}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Vào danh sách dự án
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show invitation details while processing
  if (invitationDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Lời mời tham gia dự án</h3>
            <div className="text-sm text-gray-600 mb-6 space-y-2">
              <p>
                <strong>{invitationDetails.inviterName || "Một thành viên"}</strong> đã mời bạn tham gia
              </p>
              <p className="text-lg font-semibold text-blue-600">{invitationDetails.projectName || "Dự án"}</p>
              <p>
                Vai trò: <span className="font-medium capitalize">{invitationDetails.role}</span>
              </p>
              <p className="text-xs text-gray-500">
                Hết hạn: {new Date(invitationDetails.expiresAt).toLocaleString("vi-VN")}
              </p>
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-4">Đang xử lý lời mời của bạn...</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

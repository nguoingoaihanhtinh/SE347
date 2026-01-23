import { useEffect } from "react";
import { useMyInvitations, useMemberActions } from "../hooks/useMember";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import type { ProjectInvitation } from "../types/projectMember";

export default function MyInvitationsPage() {
  const { invitations, isLoading, error, refetch } = useMyInvitations();
  const { acceptInvitation, declineInvitation, isLoading: actionLoading } = useMemberActions();

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleAccept = async (token: string) => {
    try {
      await acceptInvitation(token);
      toast.success("Đã chấp nhận lời mời!");
      refetch();
    } catch (err) {
      toast.error("Không thể chấp nhận lời mời");
    }
  };

  const handleDecline = async (token: string) => {
    try {
      await declineInvitation(token);
      toast.success("Đã từ chối lời mời");
      refetch();
    } catch (err) {
      toast.error("Không thể từ chối lời mời");
    }
  };

  if (isLoading) return <div>Đang tải lời mời...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Lời mời tham gia dự án</h1>

      {invitations.length === 0 ? (
        <p className="text-gray-500">Bạn chưa có lời mời nào.</p>
      ) : (
        <div className="space-y-4">
          {invitations.map((inv: ProjectInvitation) => (
            <div key={inv.id} className="border p-4 rounded-lg shadow-sm bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    Dự án ID: <span className="text-blue-600">{inv.projectId}</span>
                  </p>
                  <p className="text-sm text-gray-600">Mời bởi: {inv.inviterUserId} (chưa có tên)</p>
                  <p className="text-sm">
                    Vai trò: <span className="font-medium capitalize">{inv.role}</span>
                  </p>
                  <p className="text-xs text-gray-500">Hết hạn: {new Date(inv.expiresAt).toLocaleString("vi-VN")}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAccept(inv.token)}
                    disabled={actionLoading}
                    className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Chấp nhận
                  </button>
                  <button
                    onClick={() => handleDecline(inv.token)}
                    disabled={actionLoading}
                    className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link to="/projects" className="text-blue-600 hover:underline font-medium">
          Quay lại danh sách dự án
        </Link>
      </div>
    </div>
  );
}

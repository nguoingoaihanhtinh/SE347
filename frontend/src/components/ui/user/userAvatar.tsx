import { memo } from "react";
import { Avatar } from "antd";
import { FaUserAltSlash } from "react-icons/fa";
import { useUserById } from "../../../hooks/useUser";

type Props = {
  userId?: string;
  size?: number;
  isDisplayName?: boolean;
};

function buildCloudinaryUrl(url: string, size: number) {
  if (!url) return "";
  return url.replace("/upload/", `/upload/w_${size},h_${size},c_fill,f_auto,q_auto/`);
}

const UserAvatar = memo(({ userId, size = 28, isDisplayName = true }: Props) => {
  const { user, isLoading } = useUserById(userId || "");

  // Xử lý trường hợp không có userId
  if (!userId) {
    return (
      <div className="flex flex-row items-center justify-start gap-2">
        <div className="flex items-center justify-center rounded-full bg-gray-200 p-1">
          <FaUserAltSlash className="text-gray-500" />
        </div>
        {isDisplayName && <span className="text-sm font-medium text-gray-700">Unassigned</span>}
      </div>
    );
  }

  // Xử lý loading state
  if (isLoading) {
    return (
      <div className="flex flex-row items-center gap-2">
        <div className="animate-pulse rounded-full bg-gray-200" style={{ width: size, height: size }} />
        {isDisplayName && <span className="text-sm font-medium text-gray-400">Loading...</span>}
      </div>
    );
  }

  // Xử lý khi có user data
  const avatarUrl = user?.avatar ? buildCloudinaryUrl(user.avatar, size) : "";

  return (
    <div className="flex flex-row items-center gap-2">
      <Avatar
        size={size}
        src={avatarUrl || undefined}
        style={{
          backgroundColor: avatarUrl ? "transparent" : "rgba(161, 157, 157)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: `${Math.floor(size / 2.5)}px`,
          fontWeight: 500,
          textTransform: "uppercase",
          border: "2px solid white",
        }}
      >
        {!avatarUrl && (
          <span className="select-none">{user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}</span>
        )}
      </Avatar>

      {isDisplayName && <p className="text-sm font-medium text-gray-700">{user?.fullName || "Unknown User"}</p>}
    </div>
  );
});

export default UserAvatar;

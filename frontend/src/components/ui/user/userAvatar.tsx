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
  // Chèn transform Cloudinary vào (w,h,c_fill,f_auto,q_auto)
  return url.replace("/upload/", `/upload/w_${size},h_${size},c_fill,f_auto,q_auto/`);
}

const UserAvatar = memo(({ userId, size = 28, isDisplayName = true }: Props) => {
  const { user } = useUserById(userId || "");

  if (!userId) {
    return (
      <div className="flex flex-row items-center justify-start gap-2">
        <div className="flex items-center justify-center rounded-full bg-gray-200 p-1">
          <FaUserAltSlash />
        </div>
        {isDisplayName && <span className="text-sm font-medium text-gray-700">Unassigned</span>}
      </div>
    );
  }

  const avatarUrl = user?.avatar ? buildCloudinaryUrl(user.avatar, size) : "";

  return (
    <div className="flex flex-row items-center gap-2">
      <Avatar
        size={size}
        src={
          avatarUrl ? (
            <img
              src={avatarUrl}
              srcSet={`
                ${buildCloudinaryUrl(user?.avatar || "", size)} 1x,
                ${buildCloudinaryUrl(user?.avatar || "", size * 2)} 2x
              `}
              alt={`user avatar`}
              loading="lazy"
            />
          ) : undefined
        }
        style={{
          backgroundColor: "rgba(161, 157, 157)",
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
        {user?.fullName}
      </Avatar>

      {isDisplayName && <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>}
    </div>
  );
});

export default UserAvatar;

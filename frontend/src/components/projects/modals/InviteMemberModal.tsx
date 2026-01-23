// src/components/projects/InviteMemberModal.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Box,
  Typography,
  IconButton,
  Stack,
  Chip,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { TeamMemberRole } from "@/types/projectMember";
import { memberApi } from "@/apis/member";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  onInviteSuccess?: () => void;
}

interface RoleOption {
  value: TeamMemberRole;
  label: string;
  description: string;
  color: "primary" | "secondary" | "default";
}

const roleOptions: RoleOption[] = [
  {
    value: "admin",
    label: "Admin",
    description: "Có thể quản lý thành viên và cài đặt project",
    color: "secondary",
  },
  {
    value: "member",
    label: "Member",
    description: "Có thể tạo và chỉnh sửa issues",
    color: "primary",
  },
  {
    value: "viewer",
    label: "Viewer",
    description: "Chỉ có thể xem, không thể chỉnh sửa",
    color: "default",
  },
];

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  onInviteSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamMemberRole>("member");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);

    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không hợp lệ");
      return;
    }

    setIsLoading(true);

    try {
      await memberApi.inviteMember(projectId, { email, role });

      setSuccess(true);
      setEmail("");

      if (onInviteSuccess) {
        onInviteSuccess();
      }

      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi gửi lời mời");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setRole("member");
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading && !success) {
      handleSubmit();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: 24,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                bgcolor: "primary.lighter",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PersonAddIcon color="primary" />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Mời thành viên
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {projectName}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Success Alert */}
        {success && (
          <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body2" fontWeight={600}>
              Đã gửi lời mời thành công!
            </Typography>
            <Typography variant="caption">Email mời đã được gửi đến {email}</Typography>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body2" fontWeight={600}>
              Lỗi
            </Typography>
            <Typography variant="caption">{error}</Typography>
          </Alert>
        )}

        {/* Email Input */}
        <TextField
          fullWidth
          label="Email của người được mời"
          placeholder="example@email.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading || success}
          variant="outlined"
          sx={{ mb: 3 }}
          autoFocus
        />

        {/* Role Selection */}
        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
            Vai trò
          </FormLabel>
          <RadioGroup value={role} onChange={(e) => setRole(e.target.value as TeamMemberRole)}>
            <Stack spacing={1.5}>
              {roleOptions.map((option) => (
                <Box
                  key={option.value}
                  sx={{
                    border: 2,
                    borderColor: role === option.value ? "primary.main" : "divider",
                    borderRadius: 2,
                    p: 2,
                    transition: "all 0.2s",
                    bgcolor: role === option.value ? "primary.lighter" : "transparent",
                    "&:hover": {
                      borderColor: "primary.light",
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <FormControlLabel
                    value={option.value}
                    control={<Radio disabled={isLoading || success} />}
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                          <Typography variant="body1" fontWeight={600}>
                            {option.label}
                          </Typography>
                          <Chip label={option.value} size="small" color={option.color} />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {option.description}
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, width: "100%" }}
                  />
                </Box>
              ))}
            </Stack>
          </RadioGroup>
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
        <Button onClick={handleClose} disabled={isLoading} color="inherit" sx={{ px: 3 }}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || success}
          variant="contained"
          startIcon={
            isLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : success ? (
              <CheckCircleIcon />
            ) : (
              <PersonAddIcon />
            )
          }
          sx={{ px: 3, fontWeight: 600 }}
        >
          {isLoading ? "Đang gửi..." : success ? "Đã gửi" : "Gửi lời mời"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InviteMemberModal;

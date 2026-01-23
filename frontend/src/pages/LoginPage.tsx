import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../stores/authStore";
import InputField from "../components/ui/InputField";
import { Button } from "../components/ui/Button";
import { useLocation, useNavigate, Link } from "react-router-dom";
import type { Location } from "react-router-dom";
import { useMemo, useState } from "react"; // Chỉ dùng useMemo thay vì useEffect + setState
import AuthBanner from "../components/auth/AuthBanner";
import AuthFormContainer from "../components/auth/AuthFormContainer";
import { extractErrorMessage } from "../types/api";

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const [formError, setFormError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  // Fix: Dùng useMemo thay vì useEffect + setState đồng bộ
  const hasPendingInvitation = useMemo(() => {
    return !!localStorage.getItem("pendingInvitation");
  }, []); // Chỉ tính 1 lần khi mount

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setFormError(null);

      console.log("🔐 Login attempt started for:", values.email, "Remember Me:", rememberMe);

      // CRITICAL: Wait for login to complete - this ensures token is saved to storage
      await login(values.email, values.password, rememberMe);

      // CRITICAL: Verify token is in storage before navigation
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("❌ Login Failed - Token not found in storage after login");
        setFormError("Đăng nhập thất bại. Vui lòng thử lại.");
        return;
      }

      console.log("✅ Login Success - Token verified in localStorage");

      // Get the updated user from store (should be set by login function)
      const loggedInUser = useAuthStore.getState().user;
      const isAuth = useAuthStore.getState().isAuthenticated;

      console.log("✅ Login Success - User state:", {
        user: loggedInUser?.email,
        role: loggedInUser?.role,
        isAuthenticated: isAuth,
      });

      // CRITICAL: Only navigate if authenticated
      if (!isAuth) {
        console.error("❌ Login Failed - isAuthenticated is false after login");
        setFormError("Đăng nhập thất bại. Vui lòng thử lại.");
        return;
      }

      const hadPendingInvitation = hasPendingInvitation;

      // Xóa pending invitation sau khi xử lý
      localStorage.removeItem("pendingInvitation");
      localStorage.removeItem("pendingProjectId");

      if (hadPendingInvitation) {
        navigate("/projects", {
          state: { message: "Successfully joined the project!" },
        });
        return;
      }

      // ROLE-BASED REDIRECTION
      if (loggedInUser?.role === "admin" || loggedInUser?.role === "super_admin") {
        console.log("🚀 Redirecting to /admin");
        navigate("/admin", { replace: true });
      } else {
        const from = (location.state as { from?: Location })?.from?.pathname || "/";
        console.log("🚀 Redirecting to:", from);
        navigate(from, { replace: true });
      }
    } catch (error: unknown) {
      const message = extractErrorMessage(error);
      console.error("❌ Login Error:", message);
      setFormError(message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden py-12 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
      <div
        className="w-[90%] h-full max-w-5xl flex rounded-3xl overflow-hidden bg-white/85 backdrop-blur-md"
        style={{ boxShadow: "0 0 50px rgba(0, 0, 0, 0.18), inset 0 0 0 1px rgba(255,255,255,0.08)" }}
      >
        <AuthBanner subtitle="Quản lý dự án, sprint và issue trong một nền tảng." />
        <AuthFormContainer
          title="Đăng nhập"
          subtitle={
            hasPendingInvitation
              ? "Đăng nhập để chấp nhận lời mời tham gia dự án."
              : "Đăng nhập để tiếp tục làm việc cùng đội ngũ của bạn."
          }
          swapLink={{ text: "Đăng ký", href: "/register" }}
        >
          {hasPendingInvitation && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Bạn có lời mời tham gia dự án</p>
                  <p className="text-xs text-blue-600 mt-1">Đăng nhập để chấp nhận lời mời</p>
                </div>
              </div>
            </div>
          )}
          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <InputField
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <InputField
              type="password"
              autoComplete="current-password"
              placeholder="Mật khẩu"
              error={errors.password?.message}
              {...register("password")}
            />
            {formError && <p className="text-xs text-red-600 mt-1">{formError}</p>}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="inline-flex items-center gap-1.5 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 cursor-pointer"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Ghi nhớ đăng nhập
              </label>
              <Link to="/forgot-password" replace className="text-blue-600 hover:underline font-medium">
                Quên mật khẩu?
              </Link>
            </div>
            <Button type="submit" className="w-full mt-4" size="md" isLoading={isSubmitting}>
              {hasPendingInvitation ? "Đăng nhập và tham gia dự án" : "Đăng nhập"}
            </Button>
          </form>
        </AuthFormContainer>
      </div>
    </div>
  );
}

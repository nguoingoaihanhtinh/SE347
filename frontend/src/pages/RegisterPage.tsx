import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../stores/authStore";
import InputField from "../components/ui/InputField";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AuthBanner from "../components/auth/AuthBanner";
import AuthFormContainer from "../components/auth/AuthFormContainer";
import { authApi } from "../lib/api";

const schema = z
  .object({
    firstName: z.string().min(1, "Họ không được trống"),
    lastName: z.string().min(1, "Tên không được trống"),
    email: z.string().email("Email không hợp lệ"),
    password: z
      .string()
      .min(8, "Mật khẩu tối thiểu 8 ký tự")
      .regex(/[A-Z]/, "Phải có chữ hoa")
      .regex(/[a-z]/, "Phải có chữ thường")
      .regex(/[0-9]/, "Phải có số")
      .regex(/[^A-Za-z0-9]/, "Phải có ký tự đặc biệt"),
    confirmPassword: z.string().min(8, "Xác nhận mật khẩu tối thiểu 8 ký tự"),
    otp: z
      .string()
      .length(6, "Mã OTP phải có 6 số")
      .regex(/^\d+$/, "Mã OTP chỉ chứa số"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  const [formError, setFormError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const emailValue = watch("email");

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async () => {
    try {
      setOtpError(null);
      if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        setOtpError("Vui lòng nhập email hợp lệ");
        return;
      }

      setSendingOtp(true);
      await authApi.sendOtp(emailValue);
      setOtpSent(true);
      setCountdown(60);
      setOtpError(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gửi mã xác nhận thất bại";
      setOtpError(message);
    } finally {
      setSendingOtp(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setFormError(null);
      await registerUser(
        values.firstName,
        values.lastName,
        values.email,
        values.password,
        values.confirmPassword,
        values.otp
      );
      navigate("/", { replace: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Đăng ký thất bại";
      setFormError(message);
      if (message.toLowerCase().includes("otp") || message.toLowerCase().includes("xác nhận")) {
        setValue("otp", "");
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 overflow-hidden">
      <div className="w-[90%] h-[90%] max-w-[1600px] flex rounded-3xl shadow-2xl overflow-hidden bg-white">
        <AuthBanner title="Tạo tài khoản" subtitle="Bắt đầu theo dõi dự án, sprint và issue cùng đội ngũ của bạn." />

        <AuthFormContainer
          title="Đăng ký"
          subtitle="Tạo tài khoản để đồng bộ hóa công việc của bạn."
          swapLink={{ text: "Đăng nhập", href: "/login" }}
        >
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField autoComplete="given-name" placeholder="Họ" error={errors.firstName?.message} {...register("firstName")} />
              <InputField autoComplete="family-name" placeholder="Tên" error={errors.lastName?.message} {...register("lastName")} />
            </div>

            <div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <InputField
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || countdown > 0}
                  className="shrink-0 w-36"
                >
                  {countdown > 0 ? `Gửi lại (${countdown}s)` : sendingOtp ? "Đang gửi..." : "Gửi xác nhận"}
                </Button>
              </div>
              {otpError && <p className="mt-1 text-xs text-red-600">{otpError}</p>}
            </div>

            {otpSent && (
              <InputField
                type="text"
                placeholder="Nhập mã OTP (6 số)"
                error={errors.otp?.message}
                maxLength={6}
                {...register("otp")}
              />
            )}

            <InputField
              type="password"
              autoComplete="new-password"
              placeholder="Mật khẩu (8+ ký tự, chữ hoa, thường, số, ký tự đặc biệt)"
              error={errors.password?.message}
              {...register("password")}
            />
            <InputField
              type="password"
              autoComplete="new-password"
              placeholder="Xác nhận mật khẩu"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
              Tạo tài khoản
            </Button>
          </form>
        </AuthFormContainer>
      </div>
    </div>
  );
}


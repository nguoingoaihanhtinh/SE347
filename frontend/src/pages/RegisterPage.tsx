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
    password: z.string().superRefine((val, ctx) => {
      const missing: string[] = [];
      if (val.length < 8) missing.push("tối thiểu 8 ký tự");
      if (!/[A-Z]/.test(val)) missing.push("chữ hoa");
      if (!/[a-z]/.test(val)) missing.push("chữ thường");
      if (!/[0-9]/.test(val)) missing.push("số");
      if (!/[^A-Za-z0-9]/.test(val)) missing.push("ký tự đặc biệt");
      
      if (missing.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Mật khẩu cần có ${missing.join(", ")}`,
        });
      }
    }),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
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
      let message = error instanceof Error ? error.message : "Gửi mã xác nhận thất bại";
      // Translate common error codes to Vietnamese
      if (message.includes("400") || message.includes("already exists")) {
        message = "Tài khoản đã tồn tại. Vui lòng đăng nhập.";
      }
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
      // PUSH to history stack: [Register, Home] - allows back button to work
      navigate("/");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Đăng ký thất bại";
      setFormError(message);
      if (message.toLowerCase().includes("otp") || message.toLowerCase().includes("xác nhận")) {
        setValue("otp", "");
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center overflow-hidden py-12 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100"
    >
      <div className="w-[90%] h-full max-w-5xl flex rounded-3xl overflow-hidden bg-white/85 backdrop-blur-md" style={{ boxShadow: '0 0 50px rgba(0, 0, 0, 0.18), inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
        <AuthBanner subtitle="Quản lý dự án, sprint và issue trong một nền tảng." />

        <AuthFormContainer
          title="Đăng ký"
          subtitle="Tạo tài khoản để đồng bộ hóa công việc của bạn."
          swapLink={{ text: "Đăng nhập", href: "/login" }}
        >
          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-2">
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
                  size="sm"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || countdown > 0}
                  className="shrink-0 w-32 h-10 text-xs"
                >
                  {countdown > 0 ? `Gửi lại (${countdown}s)` : sendingOtp ? "Đang gửi..." : "Gửi xác nhận"}
                </Button>
              </div>
              {otpError && <p className="mt-0.5 text-xs text-red-600">{otpError}</p>}
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
              placeholder="Mật khẩu"
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

            {formError && <p className="text-xs text-red-600 mt-1">{formError}</p>}

            <Button type="submit" className="w-full mt-4" size="md" isLoading={isSubmitting}>
              Tạo tài khoản
            </Button>
          </form>
        </AuthFormContainer>
      </div>
    </div>
  );
}


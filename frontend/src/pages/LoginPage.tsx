import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../stores/authStore";
import InputField from "../components/ui/InputField";
import { Button } from "../components/ui/Button";
import { useLocation, useNavigate, Link } from "react-router-dom";
import type { Location } from "react-router-dom";
import { useState } from "react";
import AuthBanner from "../components/auth/AuthBanner";
import AuthFormContainer from "../components/auth/AuthFormContainer";

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
      await login(values.email, values.password);
      const from = (location.state as { from?: Location })?.from?.pathname || "/";
      // PUSH to history stack: [Login, Home] - allows back button to work
      navigate(from);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Đăng nhập thất bại";
      setFormError(message);
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center overflow-hidden py-12 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100"
    >
      <div className="w-[90%] h-full max-w-5xl flex rounded-3xl overflow-hidden bg-white/85 backdrop-blur-md" style={{ boxShadow: '0 0 50px rgba(0, 0, 0, 0.18), inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
        <AuthBanner subtitle="Quản lý dự án, sprint và issue trong một nền tảng." />

        <AuthFormContainer
          title="Đăng nhập"
          subtitle="Đăng nhập để tiếp tục làm việc cùng đội ngũ của bạn."
          swapLink={{ text: "Đăng ký", href: "/register" }}
        >
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
                <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600" />
                Ghi nhớ đăng nhập
              </label>
              <Link to="/forgot-password" replace className="text-blue-600 hover:underline font-medium">
                Quên mật khẩu?
              </Link>
            </div>

            <Button type="submit" className="w-full mt-4" size="md" isLoading={isSubmitting}>
              Đăng nhập
            </Button>
          </form>
        </AuthFormContainer>
      </div>
    </div>
  );
}


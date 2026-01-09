import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../stores/authStore";
import InputField from "../components/ui/InputField";
import { Button } from "../components/ui/Button";
import { useLocation, useNavigate } from "react-router-dom";
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
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Đăng nhập thất bại";
      setFormError(message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 overflow-hidden">
      <div className="w-[90%] h-[90%] max-w-[1600px] flex rounded-3xl shadow-2xl overflow-hidden bg-white">
        <AuthBanner title="Chào mừng trở lại" subtitle="Quản lý dự án, sprint và issue trong một nền tảng." />

        <AuthFormContainer
          title="Đăng nhập"
          subtitle="Đăng nhập để tiếp tục làm việc cùng đội ngũ của bạn."
          swapLink={{ text: "Đăng ký", href: "/register" }}
        >
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                Ghi nhớ đăng nhập
              </label>
              <button type="button" className="text-blue-600 hover:underline">
                Quên mật khẩu?
              </button>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
              Đăng nhập
            </Button>
          </form>
        </AuthFormContainer>
      </div>
    </div>
  );
}


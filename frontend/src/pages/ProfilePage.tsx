import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../components/ui/InputField";
import { Button } from "../components/ui/Button";
import { useAuthStore } from "../stores/authStore";

const schema = z.object({
  firstName: z.string().min(1, "Họ không được trống"),
  lastName: z.string().min(1, "Tên không được trống"),
  email: z.string().email("Email không hợp lệ"),
  avatar: z.string().url("Avatar phải là URL hợp lệ").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user, loadUser } = useAuthStore();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) void loadUser();
  }, [user, loadUser]);

  const defaultValues = useMemo<FormValues>(
    () => ({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      avatar: user?.avatar || "",
    }),
    [user],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = async () => {
    setMessage(null);
    // TODO: Gọi API update profile
    setMessage("Đã ghi nhận thay đổi (demo). Vui lòng kết nối API để lưu thực tế.");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-slate-500">
              {user ? user.firstName?.[0] : "U"}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-slate-500">Hồ sơ cá nhân</p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {user ? `${user.firstName} ${user.lastName}` : "Đang tải..."}
          </h1>
        </div>
      </div>

      <form
        className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField label="Họ" error={errors.firstName?.message} {...register("firstName")} />
          <InputField label="Tên" error={errors.lastName?.message} {...register("lastName")} />
        </div>
        <InputField label="Email" type="email" error={errors.email?.message} {...register("email")} />
        <InputField label="Avatar URL" error={errors.avatar?.message} {...register("avatar")} />

        {message && <p className="text-sm text-blue-600">{message}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" isLoading={isSubmitting}>
            Lưu thay đổi
          </Button>
          <Button type="button" variant="ghost" onClick={() => reset(defaultValues)}>
            Đặt lại
          </Button>
        </div>
      </form>
    </div>
  );
}

import clsx from "clsx";
import React, { useState } from "react";

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  as?: "input" | "textarea";
}

export function InputField({ label, error, className, as = "input", type, ...props }: InputFieldProps) {
  const InputTag = as === "textarea" ? "textarea" : "input";
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <InputTag
          className={clsx(
            "w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100",
            error ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "",
            className
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${props.name}-error` : undefined}
          type={inputType}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            className="absolute inset-y-0 right-2 flex w-12 items-center justify-center rounded-md text-xs font-medium text-slate-500 hover:bg-slate-100"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? "Ẩn" : "Hiện"}
          </button>
        )}
      </div>
      {label && <span className="text-xs font-medium text-slate-600">{label}</span>}
      {error && (
        <span id={`${props.name}-error`} className="text-xs text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}

export default InputField;


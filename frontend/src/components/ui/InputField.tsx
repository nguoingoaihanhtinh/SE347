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
    <div className="flex flex-col">
      <div className="relative">
        <InputTag
          className={clsx(
            "w-full h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm shadow-sm transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100",
            error ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100" : "",
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
            className="absolute top-1.5 bottom-1.5 right-2 flex w-9 items-center justify-center rounded-md text-xs font-medium text-slate-500 hover:bg-slate-100"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? "Ẩn" : "Hiện"}
          </button>
        )}
      </div>
      {label && <span className="mt-1 text-xs font-medium text-slate-600">{label}</span>}
      {error && (
        <span id={`${props.name}-error`} className="mt-0.5 text-xs text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}

export default InputField;


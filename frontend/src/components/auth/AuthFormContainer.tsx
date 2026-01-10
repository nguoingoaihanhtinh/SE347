import { Link } from "react-router-dom";

interface AuthFormContainerProps {
  title: string;
  subtitle: string;
  swapLink: {
    text: string;
    href: string;
  };
  children: React.ReactNode;
}

export default function AuthFormContainer({ title, subtitle, swapLink, children }: AuthFormContainerProps) {
  return (
    <div className="w-full md:w-[40%] h-full bg-white relative flex flex-col justify-center items-center px-8 py-24">
      {/* Fixed position swap link - top right corner */}
      <Link
        to={swapLink.href}
        replace
        className="absolute top-8 right-8 text-xs font-medium text-blue-600 hover:underline"
      >
        {swapLink.text}
      </Link>

      {/* Centered content container */}
      <div className="flex flex-col items-center w-full max-w-sm">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
        </div>

        {/* Form content */}
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}



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
    <div className="w-1/2 h-full bg-white relative flex flex-col px-12">
      {/* Fixed position swap link - top right corner */}
      <Link
        to={swapLink.href}
        replace
        className="absolute top-10 right-10 text-sm font-medium text-blue-600 hover:underline"
      >
        {swapLink.text}
      </Link>

      {/* Fixed position header - always at same Y coordinate */}
      <div className="pt-32 flex flex-col items-center text-center">
        <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-3 text-sm text-slate-500">{subtitle}</p>
      </div>

      {/* Form content - fixed spacing from header */}
      <div className="mt-10 flex flex-col items-center">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}



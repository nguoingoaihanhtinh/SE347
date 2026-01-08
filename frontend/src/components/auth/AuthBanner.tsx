interface AuthBannerProps {
  title: string;
  subtitle: string;
  appName?: string;
}

export default function AuthBanner({ title, subtitle, appName = "TaskManager" }: AuthBannerProps) {
  return (
    <div className="w-1/2 h-full relative flex flex-col items-center text-white bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600">
      <div className="absolute top-[25%] left-1/2 -translate-x-1/2 flex flex-col items-center text-center w-full px-12">
        <div className="text-4xl font-bold tracking-tight">{appName}</div>
        <h1 className="mt-10 text-3xl font-semibold">{title}</h1>
        <p className="mt-6 text-cyan-50 max-w-sm leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
}



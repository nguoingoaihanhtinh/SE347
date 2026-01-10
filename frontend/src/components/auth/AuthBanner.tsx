interface AuthBannerProps {
  subtitle: string;
  appName?: string;
}

export default function AuthBanner({ subtitle, appName = "TaskManager" }: AuthBannerProps) {
  return (
    <div 
      className="w-full md:w-[60%] h-full relative flex flex-col items-center"
      style={{
        backgroundImage: "url('/images/last_bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: 'saturate(1.3) contrast(1.1)', // Làm đậm màu xanh của ảnh
      }}
    >
      {/* Content - Positioned higher */}
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 flex flex-col items-center text-center px-12 w-full z-10">
        {/* Brand Name - Smaller size */}
        <h1 className="text-5xl font-semibold tracking-tight text-white mb-3">
          {appName}
        </h1>
        
        {/* Tagline - Small & Light */}
        <p className="text-sm font-light text-white/90 max-w-md leading-relaxed">
          {subtitle}
        </p>
      </div>
    </div>
  );
}



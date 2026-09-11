type LogoProps = {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
};

function Logo({ size = 40, className = '', showText = true, textClassName = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 shadow-lg shadow-emerald-500/30 overflow-hidden"
        style={{ width: size, height: size }}
      >
        {/* Glossy highlight */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30 rounded-2xl"></div>

        {/* Stylized "E" mark with coin accent */}
        <svg
          width={size * 0.62}
          height={size * 0.62}
          viewBox="0 0 100 100"
          fill="none"
          className="relative"
        >
          {/* Outer coin ring */}
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="white"
            strokeWidth="5"
            opacity="0.35"
          />
          {/* Stylized E */}
          <path
            d="M62 28 L34 28 L34 72 L62 72"
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Middle bar of E */}
          <path
            d="M34 50 L54 50"
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Upward arrow inside E — represents growth/earning */}
          <path
            d="M50 64 L50 40 M44 46 L50 40 L56 46"
            stroke="#34d399"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.95"
          />
        </svg>
      </div>

      {showText && (
        <span className={`text-xl font-bold text-secondary-900 ${textClassName}`}>
          Earn<span className="text-emerald-600">IQ</span>
        </span>
      )}
    </div>
  );
}

export default Logo;

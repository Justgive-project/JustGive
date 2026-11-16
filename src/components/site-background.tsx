export function SiteBackground() {
  return (
    <div className="site-background" aria-hidden="true">
      <svg className="hero-wave" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <defs>
          <linearGradient id="waveFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--wave-top)" stopOpacity=".55" />
            <stop offset=".45" stopColor="var(--wave-mid)" stopOpacity=".24" />
            <stop offset="1" stopColor="var(--wave-bottom)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="waveRidge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--wave-ridge-a)" />
            <stop offset=".35" stopColor="var(--wave-ridge-b)" />
            <stop offset=".7" stopColor="var(--wave-ridge-c)" />
            <stop offset="1" stopColor="var(--wave-ridge-d)" />
          </linearGradient>
          <filter id="waveBlur" x="-5%" y="-60%" width="110%" height="220%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>
        <path d="M0 150 C170 190 330 170 520 118 C700 70 840 56 990 108 C1110 150 1190 196 1310 186 C1380 180 1415 150 1440 118 L1440 320 L0 320 Z" fill="url(#waveFill)" />
        <path className="hero-wave-blur" d="M0 150 C170 190 330 170 520 118 C700 70 840 56 990 108 C1110 150 1190 196 1310 186 C1380 180 1415 150 1440 118" fill="none" stroke="url(#waveRidge)" strokeWidth="16" opacity=".55" filter="url(#waveBlur)" vectorEffect="non-scaling-stroke" />
        <path className="hero-wave-mobile-glow" d="M0 150 C170 190 330 170 520 118 C700 70 840 56 990 108 C1110 150 1190 196 1310 186 C1380 180 1415 150 1440 118" fill="none" stroke="url(#waveRidge)" strokeWidth="10" opacity=".18" vectorEffect="non-scaling-stroke" />
        <path d="M0 150 C170 190 330 170 520 118 C700 70 840 56 990 108 C1110 150 1190 196 1310 186 C1380 180 1415 150 1440 118" fill="none" stroke="url(#waveRidge)" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

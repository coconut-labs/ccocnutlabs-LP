export function PaperFoldSvgFallback() {
  return (
    <svg
      aria-hidden="true"
      className="h-full w-full"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 900 680"
    >
      <g style={{ animation: "paper-float 9s ease-in-out infinite", willChange: "transform" }}>
        <path d="M175 455 374 92l331 118-142 382Z" fill="#F7F3E8" stroke="#1A1611" strokeOpacity=".26" />
        <path d="M374 92 439 422 705 210Z" fill="#D4D9C6" stroke="#1A1611" strokeOpacity=".18" />
        <path d="M175 455 439 422 563 592Z" fill="#ECE6D6" stroke="#1A1611" strokeOpacity=".18" />
        <path d="M439 422 705 210 563 592Z" fill="#DED5C2" stroke="#1A1611" strokeOpacity=".18" />
        <path d="M374 92 439 422 175 455" stroke="#9B6B1F" strokeOpacity=".42" strokeWidth="2" />
        <path d="M439 422 563 592" stroke="#4A5B49" strokeOpacity=".35" strokeWidth="2" />
      </g>
    </svg>
  );
}

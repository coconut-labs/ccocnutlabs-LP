"use client";

export function PageTearShader() {
  return (
    <div
      aria-hidden="true"
      className="h-full w-full bg-bg-1"
      style={{ clipPath: "polygon(0 0, 100% 0, 94% 38%, 100% 100%, 0 100%, 7% 55%)" }}
    />
  );
}

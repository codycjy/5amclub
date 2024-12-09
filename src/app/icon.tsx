// src/app/icon.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const contentType = "image/png";

export const size = {
  width: 512,
  height: 512,
};

export default async function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="512"
          height="512"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2v8" />
          <path d="m4.93 10.93 1.41 1.41" />
          <path d="M2 18h2" />
          <path d="M20 18h2" />
          <path d="m19.07 10.93-1.41 1.41" />
          <path d="M22 22H2" />
          <path d="m8 6 4-4 4 4" />
          <path d="M16 18a4 4 0 0 0-8 0" />
        </svg>
      </div>
    ),
    {
      ...size,
    },
  );
}

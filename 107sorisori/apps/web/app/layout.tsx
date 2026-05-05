import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "SoriSori (Local AI)",
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{props.children}</body>
    </html>
  );
}

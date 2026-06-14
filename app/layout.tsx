import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const yekanBakh = localFont({
  src: [
    {
      path: "./fonts/woff2/YekanBakh-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "./fonts/woff2/YekanBakh-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/woff2/YekanBakh-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/woff2/YekanBakh-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/woff2/YekanBakh-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/woff2/YekanBakh-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/woff2/YekanBakh-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-yekan-bakh",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CRM Panel",
  description: "Sales CRM panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${yekanBakh.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

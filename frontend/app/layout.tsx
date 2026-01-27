import type { Metadata } from "next";
import "../src/styles/main.scss";

export const metadata: Metadata = {
  title: "Ghazaryan SoftWare",
  description: "my application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

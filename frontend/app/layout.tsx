import "../src/styles/main.scss";
import { Header } from "@/src/components/layout/Header";
import { AuthInitializer } from "@/src/components/providers/AuthInitializer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Ghazaryan SoftWare</title>
        <meta name="description" content="my application" />
      </head>
      <AuthInitializer>
        <body className="container">
          <Header />
          <main>
            {children}
          </main>
        </body>
      </AuthInitializer>
    </html>
  );
}

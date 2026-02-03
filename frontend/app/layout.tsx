import "../src/styles/main.scss";
import { Header } from "@/src/components/layout/header/Header";
import { AuthInitializer } from "@/src/components/providers/AuthInitializer";
import { ReactQueryProvider } from "@/src/components/providers/ReactQueryProvider";

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
      <ReactQueryProvider>
        <AuthInitializer>
          <body className="container">
            <Header />
            <main>
              {children}
            </main>
          </body>
        </AuthInitializer>
      </ReactQueryProvider>
    </html>
  );
}

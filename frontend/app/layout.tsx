import "../src/styles/main.scss";
import { Header } from "@/src/components/layout/header/Header";
import { AuthInitializer } from "@/src/components/providers/AuthInitializer";
import { ReduxProvider } from "@/src/components/providers/ReduxProvider";

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
      <ReduxProvider>
        <AuthInitializer>
          <body className="container">
            <Header />
            <main>
              {children}
            </main>
          </body>
        </AuthInitializer>
      </ReduxProvider>
    </html>
  );
}

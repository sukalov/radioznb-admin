import "./globals.css";

import { GeistSans } from "geist/font/sans";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";

const title = "записи радио знб";
const description = "админский сайт управления библиотекой радио зимы не будет";

export const metadata = {
  title,
  description,
  metadataBase: new URL("https://admin.radioznb.ru"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={GeistSans.variable}>
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}

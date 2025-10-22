import Header from "@/components/header";

import "@/app/globals.css";

const title = "библиотека радио знб";
const description = "управление библиотекой";

export const metadata = {
  title,
  description,
  metadataBase: new URL("https://admin.radioznb.ru"),
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="w-full">
      <Header />
      <div className="container mx-auto p-4 max-w-3xl">
        {children}
      </div>
    </main>
  );
}

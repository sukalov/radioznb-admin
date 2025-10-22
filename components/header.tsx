"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { SessionProvider, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

type Tab = "programs" | "people" | "recordings" | "genres";

export default function Header() {
  const tabs = [
    { id: "programs" as Tab, label: "передачи" },
    { id: "people" as Tab, label: "люди" },
    { id: "recordings" as Tab, label: "файлы" },
    { id: "genres" as Tab, label: "жанры" },
  ];

  const activeTab = usePathname().split("/")[1] as Tab;

  return (
    <>
      <header className="sticky flex justify-center border-b">
        <div className="flex items-center justify-between w-full h-16 px-4 mx-auto sm:px-6">
          <h1 className="text-primary text-xl">библиотека зимы не будет</h1>
          <div className="ml-auto flex items-center space-x-4">
            <SessionProvider>
              <Button variant='outline' onClick={() => signOut()}>выйти</Button>
            </SessionProvider>
          </div>
        </div>
      </header>
      <nav className="flex justify-center mx-4 sm:mx-8 md:mx-12 lg:mx-24 text-xl">
        {tabs.map((tab) => (
          <Link key={tab.id} href={`/${tab.id}`}>
            <Button variant="link" className={`${
              activeTab === tab.id ? "text-primary underline" : "text-gray-500"
            }`}>{tab.label}</Button>
          </Link>
        ))}
      </nav>
    </>
  );
}

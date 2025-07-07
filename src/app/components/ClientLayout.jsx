"use client";

import { usePathname } from "next/navigation";
import Navbar from "../components/Navbar"; // Adjust path to your Navbar component

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const showNavbar = pathname !== "/pages/shop";

  return (
    <>
      {showNavbar && <Navbar />}
      {children}
    </>
  );
}
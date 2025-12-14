"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "./Button";
// import Image from "next/image"; // remove next/image
import { useTheme } from "@/context/ThemeContext";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, toggleTheme, logoSrc } = useTheme();
  const search = searchParams.get("q") ?? "";

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }

    router.push(`/?${params.toString()}`);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between gap-4 px-6 py-3 bg-(--color-bg-secondary)">
      <Link href="/" className="flex items-center gap-2 text-(--color-text) text-3xl hover:text-(--color-primary) transition-colors garet-heavy" >
        <img src={logoSrc} alt="Logo" width={48} height={48} className="h-auto align-middle" />
        <span className="leading-none">CookHub</span>
      </Link>

      <input
        type="text"
        placeholder="Search recipes..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="flex-1 max-w-md px-3 py-2 rounded-md placeholder-(--color-text-muted) focus:outline-none"
        style={{ backgroundColor: "rgba(193,157,125,0.5)", border: "none" }}
      />

      <div className="flex items-center gap-2">
        {user ? (
          <>
            <Link href="/favorites">
              <Button variant="primary" icon="/fi-sr-heart.svg" iconOnly />
            </Link>
            <Link href="/dashboard">
              <Button variant="primary" icon="/books.svg" iconOnly />
            </Link>
            <Button variant="danger" onClick={handleLogout} icon="/user-logout.svg" iconOnly />
          </>
        ) : (
          <>
            <Link href="/login"><Button variant="primary">Log In</Button></Link>
            <Link href="/register"><Button variant="primary">Register</Button></Link>
          </>
        )}

        <ThemeToggle checked={theme === "dark"} onChange={toggleTheme} />
        <span className="ml-2 text-sm">
          {theme === "dark" ? "🌙" : "☀️"}
        </span>
      </div>
    </nav>
  );
}

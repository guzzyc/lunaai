"use client";

import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Loader2,
  LogOut,
  Search,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentPath = usePathname();
  const { data: session, status } = useSession();
  const isLoadingUser = status === "loading";
  const isAdmin = session?.user.role === "admin";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      toast.success("Signed out successfully", { richColors: true });
    } catch (error) {
      toast.error("Failed to signout", { richColors: true });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <header className="h-16 border-b-2 border-border-dark flex items-center justify-between px-6 shrink-0 z-50 bg-white">
        <div className="flex items-center gap-6">
          {/* logo */}
          <div className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Luna logo"
              width={100}
              height={28}
              priority
            />
          </div>

          {/* navigation */}
          <nav className="flex items-center gap-6 text-sm font-semibold text-subtitle-dark">
            <a href="/" className="hover:text-blue-600 transition-colors">
              Dashboard
            </a>
            <Link
              href="/news-search"
              className={cn(
                "transition-colors relative py-5 hover:text-blue-600",
                currentPath.startsWith("/news-search") && "text-blue-600"
              )}
            >
              Search
            </Link>
            <Link
              href="/trainings?type=cleaning"
              className={cn(
                "transition-colors relative py-5 hover:text-blue-600",
                currentPath.startsWith("/trainings") && "text-blue-600"
              )}
            >
              Trainings
            </Link>

            <Link
              href="/companies"
              className={cn(
                "transition-colors relative py-5 hover:text-blue-600",
                currentPath.startsWith("/companies") && "text-blue-600"
              )}
            >
              Companies
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <div className="relative group">
            <Search
              size={14}
              className="text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors"
            />
            <input
              type="text"
              placeholder="Search for anything..."
              className="pl-9 pr-4 py-2 w-[314px] border border-searchbox rounded-lg text-xs text-subtitle-dark bg-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
            />
          </div>

          <div className="relative" ref={menuRef}>
            {isLoadingUser ? (
              <ProfileSkeleton />
            ) : (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-neutral-50 transition-colors cursor-pointer border border-transparent hover:border-neutral-100"
              >
                {/* <div className="relative">
                  <Image
                    src="/profile-image.png"
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full border border-neutral-200 shadow-sm"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                </div> */}

                <div className="text-sm font-semibold text-subtitle-dark hidden md:block">
                  {session?.user.name || "User Name"}
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}

            {/* user profile menus */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                <div className="px-4 py-3 border-b border-neutral-100 mb-1">
                  <p className="text-sm font-semibold text-neutral-900">
                    {session?.user.name || "User Name"}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">
                    {session?.user.email || ""}
                  </p>
                </div>
                {isAdmin && (
                  <>
                    <Link
                      href="/users"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-blue-600 transition-colors"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                    <div className="my-1 border-t border-neutral-100"></div>
                  </>
                )}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  {signingOut ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative bg-white">
        {children}
      </main>
    </div>
  );
}

const ProfileSkeleton = () => (
  <div className="flex gap-2 items-center">
    {/* Avatar skeleton */}
    <Skeleton className="h-8 w-8 rounded-full" />

    {/* Name skeleton (hidden on mobile just like real text) */}
    <Skeleton className="h-8 w-32 hidden md:block" />

    <Skeleton className="h-4 w-4 rounded-full" />
  </div>
);

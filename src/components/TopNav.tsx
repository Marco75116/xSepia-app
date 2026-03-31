"use client";

import { Clock, Home, PlusCircle, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "@/components/WalletButton";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/activity", label: "Activity", icon: Clock },
  { href: "/add-funds", label: "Add Funds", icon: PlusCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="flex w-full items-center justify-between px-12 py-4 gap-4">
        <Link className="flex items-center gap-3 cursor-pointer" href="/">
          <Image
            src="https://xstocks.fi/favicon.svg"
            alt="xStocks"
            width={32}
            height={32}
            className="size-8"
          />
          <span className="font-medium text-2xl tracking-tight">xStocks</span>
        </Link>

        <div className="flex flex-row items-center space-x-2">
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/" || pathname.startsWith("/vault")
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <link.icon className="size-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="ml-4 flex items-center gap-3">
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
}

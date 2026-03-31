"use client";

import { Clock, Home, PlusCircle, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "HOME", icon: Home },
  { href: "/activity", label: "ACTIVITY", icon: Clock },
  { href: "/add-funds", label: "ADD FUNDS", icon: PlusCircle },
  { href: "/settings", label: "SETTINGS", icon: Settings },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg items-center justify-around px-4 pb-6 pt-2">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/" || pathname.startsWith("/vault")
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 text-[10px] font-medium tracking-wide transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isActive && tab.href === "/" ? (
                <div className="rounded-lg bg-primary px-3.5 py-1.5">
                  <tab.icon className="size-4 text-primary-foreground" />
                </div>
              ) : (
                <tab.icon className="size-4" />
              )}
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

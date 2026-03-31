"use client";

import {
  History,
  LayoutGrid,
  Menu,
  PieChart,
  RefreshCw,
  ShoppingBasket,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatAddress } from "@/lib/formatters";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { title: "Assets", href: "/", icon: LayoutGrid },
  { title: "Portfolio", href: "/portfolio", icon: PieChart },
  { title: "DCA", href: "/dca", icon: RefreshCw },
  { title: "Baskets", href: "/baskets", icon: ShoppingBasket },
  { title: "History", href: "/history", icon: History },
];

const MOCK_WALLET = "0x1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0b";

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-[0_0_12px_oklch(0.75_0.18_160_/_30%)]">
              <TrendingUp className="size-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-wide">xStocks</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  render={<Link href={item.href} />}
                  className={cn(
                    "gap-2 text-[15px] font-medium tracking-wide",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  <item.icon className="size-5" />
                  {item.title}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="hidden gap-2 border-primary/20 bg-primary/5 font-mono text-xs sm:flex"
          >
            <Wallet className="size-3.5 text-primary" />
            {formatAddress(MOCK_WALLET)}
          </Badge>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" />}
              className="md:hidden"
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-4">
                {NAV_ITEMS.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Button
                      key={item.href}
                      variant="ghost"
                      render={<Link href={item.href} />}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "justify-start gap-3 text-[15px] font-medium tracking-wide",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground",
                      )}
                    >
                      <item.icon className="size-4" />
                      {item.title}
                    </Button>
                  );
                })}
              </div>
              <Separator className="mx-4" />
              <div className="px-4">
                <Badge
                  variant="outline"
                  className="gap-2 border-primary/20 bg-primary/5 font-mono text-xs"
                >
                  <Wallet className="size-3.5 text-primary" />
                  {formatAddress(MOCK_WALLET)}
                </Badge>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

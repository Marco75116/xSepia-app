"use client";

import {
  History,
  LayoutGrid,
  PieChart,
  RefreshCw,
  ShoppingBasket,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { formatAddress } from "@/lib/formatters";

const NAV_ITEMS = [
  { title: "Assets", href: "/", icon: LayoutGrid },
  { title: "Portfolio", href: "/portfolio", icon: PieChart },
  { title: "DCA", href: "/dca", icon: RefreshCw },
  { title: "Baskets", href: "/baskets", icon: ShoppingBasket },
  { title: "History", href: "/history", icon: History },
];

const MOCK_WALLET = "0x1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0b";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <TrendingUp className="size-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">xStocks</span>
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    render={<Link href={item.href} />}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
          <Wallet className="size-4 text-primary" />
          <span className="text-xs font-mono text-muted-foreground">
            {formatAddress(MOCK_WALLET)}
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

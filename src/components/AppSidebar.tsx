"use client";

import Image from "next/image";
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
import { WalletButton } from "@/components/WalletButton";
import { getMenuList } from "@/lib/menu-list";

export function AppSidebar() {
  const pathname = usePathname();
  const menuList = getMenuList(pathname);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="pb-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Xodds">
              <Link href="/">
                <div className="flex size-8 items-center justify-center rounded-md">
                  <Image
                    src="https://xstocks.fi/favicon.svg"
                    alt="Xodds"
                    width={28}
                    height={28}
                    className="rounded-sm"
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold tracking-tight">Xodds</span>
                  <span className="text-[11px] text-sidebar-foreground/50">
                    Tokenized stocks
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator className="mx-3" />
      <SidebarContent>
        {menuList.map(({ groupLabel, menus }, groupIndex) => (
          <SidebarGroup
            key={groupIndex}
            className={groupIndex === 0 ? "mt-2" : undefined}
          >
            {groupLabel && <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {menus.map(({ href, label, icon: Icon, active, external }) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={label}
                    >
                      {external ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Icon />
                          <span>{label}</span>
                        </a>
                      ) : (
                        <Link href={href}>
                          <Icon />
                          <span>{label}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarSeparator className="mx-3" />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="group-data-[collapsible=icon]:hidden">
              <WalletButton />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

import {
  Clock,
  Headset,
  LayoutDashboard,
  type LucideIcon,
  Vault,
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  submenus: Submenu[];
  external?: boolean;
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/",
          label: "Overview",
          active: pathname === "/",
          icon: LayoutDashboard,
          submenus: [],
        },
        {
          href: "/activity",
          label: "Activity",
          active: pathname.startsWith("/activity"),
          icon: Clock,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Vaults",
      menus: [
        {
          href: "/vault/new",
          label: "New Vault",
          active: pathname === "/vault/new",
          icon: Vault,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "https://t.me/marcopoloo33",
          label: "Support",
          active: false,
          icon: Headset,
          submenus: [],
          external: true,
        },
      ],
    },
  ];
}

import {
  Clock,
  Home,
  type LucideIcon,
  PlusCircle,
  Settings,
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
          label: "Home",
          active: pathname === "/" || pathname.startsWith("/vault"),
          icon: Home,
          submenus: [],
        },
        {
          href: "/activity",
          label: "Activity",
          active: pathname.startsWith("/activity"),
          icon: Clock,
          submenus: [],
        },
        {
          href: "/add-funds",
          label: "Add Funds",
          active: pathname.startsWith("/add-funds"),
          icon: PlusCircle,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Account",
      menus: [
        {
          href: "/settings",
          label: "Settings",
          active: pathname.startsWith("/settings"),
          icon: Settings,
          submenus: [],
        },
      ],
    },
  ];
}

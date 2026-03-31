"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "sm" as const,
  md: "default" as const,
  lg: "lg" as const,
};

export function StockLogo({
  ticker,
  color,
  logo,
  size = "md",
}: {
  ticker: string;
  color: string;
  logo?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <Avatar size={sizeMap[size]}>
      {logo && <AvatarImage src={logo} alt={ticker} />}
      <AvatarFallback
        className={cn("text-white font-bold", {
          "text-[10px]": size === "sm",
          "text-xs": size === "md",
          "text-sm": size === "lg",
        })}
        style={{ backgroundColor: color }}
      >
        {ticker.replace("x", "").slice(0, 2)}
      </AvatarFallback>
    </Avatar>
  );
}

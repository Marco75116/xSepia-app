"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "size-6",
  md: "size-8",
  lg: "size-10",
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
    <Avatar className={sizeClasses[size]}>
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

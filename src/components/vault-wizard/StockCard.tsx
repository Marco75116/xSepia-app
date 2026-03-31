"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import type { Stock } from "@/lib/data";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export function StockCard({
  stock,
  selected,
  onToggle,
  index,
}: {
  stock: Stock;
  selected: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
    >
      <Card
        className={cn(
          "cursor-pointer transition-all hover:border-primary/50",
          selected && "border-primary bg-primary/5",
        )}
        onClick={onToggle}
      >
        <CardContent className="flex items-center justify-between p-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold">{stock.ticker}</p>
            <p className="truncate text-xs text-muted-foreground">
              {stock.name}
            </p>
          </div>
          <p className="font-mono text-sm font-medium">
            {formatCurrency(stock.price)}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

"use client";

import { useState } from "react";
import { StockLogo } from "@/components/StockLogo";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { DcaStrategy } from "@/lib/data";
import { DCA_STRATEGIES, getStockByTicker, INTERVAL_LABELS } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/formatters";

export function ActiveStrategies() {
  const [strategies, setStrategies] = useState<DcaStrategy[]>(DCA_STRATEGIES);

  function toggleStatus(id: string) {
    setStrategies((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === "active" ? "paused" : "active" }
          : s,
      ),
    );
  }

  return (
    <div className="space-y-4">
      <CardTitle className="text-lg tracking-wide">Active Strategies</CardTitle>
      <Separator />
      {strategies.map((strategy) => {
        const stock = getStockByTicker(strategy.ticker);
        return (
          <Card key={strategy.id}>
            <CardHeader className="flex-row items-center gap-3">
              <StockLogo
                ticker={strategy.ticker}
                color={stock?.color ?? "#666"}
                logo={stock?.logo}
              />
              <div>
                <CardTitle>{stock?.name}</CardTitle>
                <CardDescription>{strategy.ticker}</CardDescription>
              </div>
              <CardAction>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      strategy.status === "active" ? "default" : "secondary"
                    }
                  >
                    {strategy.status}
                  </Badge>
                  <Switch
                    checked={strategy.status === "active"}
                    onCheckedChange={() => toggleStatus(strategy.id)}
                  />
                </div>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <CardDescription>
                  Amount:{" "}
                  <Badge variant="secondary" className="font-mono text-xs">
                    {formatCurrency(strategy.amount)}
                  </Badge>
                </CardDescription>
                <CardDescription>
                  Interval:{" "}
                  <Badge variant="secondary" className="text-xs">
                    {INTERVAL_LABELS[strategy.interval]}
                  </Badge>
                </CardDescription>
                <CardDescription>
                  Invested:{" "}
                  <Badge variant="secondary" className="font-mono text-xs">
                    {formatCurrency(strategy.totalInvested)}
                  </Badge>
                </CardDescription>
                <CardDescription>
                  Next:{" "}
                  <Badge variant="secondary" className="text-xs">
                    {formatDate(strategy.nextExecution)}
                  </Badge>
                </CardDescription>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

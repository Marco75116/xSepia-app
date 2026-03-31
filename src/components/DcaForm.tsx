"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STOCKS } from "@/lib/data";

export function DcaForm() {
  const [ticker, setTicker] = useState("");
  const [amount, setAmount] = useState("");
  const [interval, setInterval] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create DCA Strategy</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Stock</Label>
            <Select value={ticker} onValueChange={(v) => setTicker(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select a stock" />
              </SelectTrigger>
              <SelectContent>
                {STOCKS.map((stock) => (
                  <SelectItem key={stock.ticker} value={stock.ticker}>
                    {stock.name} ({stock.ticker})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Amount (USD)</Label>
            <Input
              type="number"
              placeholder="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label>Interval</Label>
            <Select
              value={interval}
              onValueChange={(v) => setInterval(v ?? "")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!ticker || !amount || !interval}
          >
            {submitted ? "Strategy Created!" : "Create Strategy"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

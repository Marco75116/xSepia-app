"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { StockLogo } from "@/components/StockLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { STOCKS } from "@/lib/data";

type Allocation = { ticker: string; weight: number };

export function CreateBasketDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [allocations, setAllocations] = useState<Allocation[]>([
    { ticker: "AAPLx", weight: 25 },
    { ticker: "NVDAx", weight: 25 },
    { ticker: "METAx", weight: 25 },
    { ticker: "AMZNx", weight: 25 },
  ]);

  const totalWeight = allocations.reduce((sum, a) => sum + a.weight, 0);

  function updateWeight(ticker: string, weight: number) {
    setAllocations((prev) =>
      prev.map((a) => (a.ticker === ticker ? { ...a, weight } : a)),
    );
  }

  function handleCreate() {
    setOpen(false);
    setName("");
    setAllocations([
      { ticker: "AAPLx", weight: 25 },
      { ticker: "NVDAx", weight: 25 },
      { ticker: "METAx", weight: 25 },
      { ticker: "AMZNx", weight: 25 },
    ]);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4 mr-2" />
        Create Basket
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Basket</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Basket Name</Label>
            <Input
              placeholder="My Custom Basket"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Allocations</Label>
              <Badge
                variant={totalWeight === 100 ? "default" : "destructive"}
                className="font-mono text-xs"
              >
                Total: {totalWeight}%
              </Badge>
            </div>
            <div className="space-y-3">
              {allocations.map((alloc) => {
                const stock = STOCKS.find((s) => s.ticker === alloc.ticker);
                return (
                  <div key={alloc.ticker} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StockLogo
                          ticker={alloc.ticker}
                          color={stock?.color ?? "#666"}
                          logo={stock?.logo}
                          size="sm"
                        />
                        <Label className="font-normal">{stock?.name}</Label>
                      </div>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {alloc.weight}%
                      </Badge>
                    </div>
                    <Slider
                      value={[alloc.weight]}
                      onValueChange={(val) => {
                        const v = Array.isArray(val) ? val[0] : val;
                        updateWeight(alloc.ticker, v);
                      }}
                      max={100}
                      step={5}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <Button
            className="w-full"
            disabled={!name || totalWeight !== 100}
            onClick={handleCreate}
          >
            Create Basket
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

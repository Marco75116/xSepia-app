"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function probColor(p: number): string {
  if (p >= 0.6) return "text-emerald-600";
  if (p >= 0.35) return "text-amber-600";
  return "text-red-500";
}

function probBgColor(p: number): string {
  if (p >= 0.6) return "bg-emerald-500";
  if (p >= 0.35) return "bg-amber-500";
  return "bg-red-500";
}

function probLabel(p: number): string {
  if (p >= 0.6) return "High Confidence";
  if (p >= 0.35) return "Moderate";
  return "Low Probability";
}

export function SignalCard({
  question,
  probability,
  category,
  image,
  selected,
  onClick,
  index,
}: {
  question: string;
  probability: number;
  category: string;
  image: string;
  selected: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
    >
      <Card
        className={cn(
          "cursor-pointer transition-all hover:border-primary/50",
          selected && "border-primary bg-primary/5",
        )}
        onClick={onClick}
      >
        <CardContent className="flex items-start gap-3 p-4">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
            {image ? (
              <Image
                src={image}
                alt={question}
                fill
                className="object-cover"
                sizes="48px"
                unoptimized
              />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <TrendingUp className="size-5" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm font-medium leading-snug">{question}</p>

            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "font-mono text-lg font-bold",
                  probColor(probability),
                )}
              >
                {Math.round(probability * 100)}%
              </span>
              <Badge variant="secondary" className="text-[10px]">
                {probLabel(probability)}
              </Badge>
            </div>

            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  probBgColor(probability),
                )}
                style={{ width: `${probability * 100}%` }}
              />
            </div>

            <Badge variant="outline" className="text-[10px] capitalize">
              {category}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

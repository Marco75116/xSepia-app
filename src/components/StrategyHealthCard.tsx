import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StrategyHealthCard() {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
        Active Strategy
      </p>
      <Card>
        <CardContent className="space-y-1.5 p-3.5">
          <p className="text-sm font-semibold leading-tight">
            Optimization running
            <br />
            in background.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <CheckCircle2 className="size-3 text-primary" />
            <span>AI-Managed allocation</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

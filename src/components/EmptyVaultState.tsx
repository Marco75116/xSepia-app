import { ArrowRight, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyVaultState() {
  return (
    <div className="flex flex-col items-center gap-6 pt-8">
      <Card className="border-border bg-card p-8">
        <div className="flex items-center justify-center">
          <div className="rounded-xl bg-primary/10 p-5">
            <Lock className="size-8 text-primary" />
          </div>
        </div>
      </Card>

      <div className="space-y-1.5 text-center">
        <h2 className="text-lg font-semibold">Create your first Vault</h2>
        <p className="text-xs text-muted-foreground">
          Start growing your wealth on autopilot.
          <br />
          Secure your future with effortless strategies.
        </p>
      </div>

      <Link
        href="/vault/new"
        className="inline-flex h-10 w-full max-w-xs items-center justify-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-6 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
      >
        Create a Vault
        <ArrowRight className="size-3.5" />
      </Link>

      <Card className="w-full border-border bg-card">
        <CardContent className="flex items-center justify-between p-3.5">
          <div className="flex items-center gap-3">
            <div className="rounded bg-primary/10 p-1.5">
              <span className="text-[10px] text-primary">✦</span>
            </div>
            <div>
              <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                Recommended for you
              </p>
              <p className="text-xs font-medium">Aggressive Growth Strategy</p>
            </div>
          </div>
          <ChevronRight className="size-3.5 text-muted-foreground" />
        </CardContent>
      </Card>
    </div>
  );
}

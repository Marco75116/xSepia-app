import { Bell, ChevronRight, HelpCircle, Shield, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const settingsItems = [
  { icon: User, label: "Account" },
  { icon: Shield, label: "Security" },
  { icon: Bell, label: "Notifications" },
  { icon: HelpCircle, label: "Help & Support" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-sm font-semibold">Settings</h1>

      <Card className="border-border bg-card overflow-hidden">
        <CardContent className="divide-y divide-border p-0">
          {settingsItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className="flex w-full items-center justify-between px-3.5 py-3 text-left transition-colors hover:bg-accent"
            >
              <div className="flex items-center gap-2.5">
                <item.icon className="size-3.5 text-muted-foreground" />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
              <ChevronRight className="size-3.5 text-muted-foreground" />
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

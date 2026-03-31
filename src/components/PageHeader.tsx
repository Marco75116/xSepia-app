import { CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <CardTitle className="text-2xl tracking-wide">{title}</CardTitle>
          {description && (
            <CardDescription className="tracking-wide">
              {description}
            </CardDescription>
          )}
        </div>
        {action}
      </div>
      <Separator />
    </div>
  );
}

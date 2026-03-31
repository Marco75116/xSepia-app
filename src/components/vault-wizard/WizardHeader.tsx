import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const steps = [
  { number: 1, label: "Stocks" },
  { number: 2, label: "Allocation" },
  { number: 3, label: "Strategy" },
] as const;

export function WizardHeader({
  currentStep,
  onBack,
  onGoToStep,
}: {
  currentStep: 1 | 2 | 3;
  onBack: () => void;
  onGoToStep: (step: 1 | 2 | 3) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {currentStep === 1 ? (
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        ) : (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="size-4" />
          </Button>
        )}
        <h1 className="text-lg font-semibold">Create Vault</h1>
      </div>

      <div className="flex items-center gap-1.5">
        {steps.map((step, i) => (
          <div key={step.number} className="flex items-center gap-1.5">
            <button
              type="button"
              className={cn(
                "flex flex-col items-center gap-1",
                step.number < currentStep && "cursor-pointer",
              )}
              disabled={step.number >= currentStep}
              onClick={() => {
                if (step.number < currentStep) {
                  onGoToStep(step.number);
                }
              }}
            >
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  step.number < currentStep &&
                    "bg-primary text-primary-foreground",
                  step.number === currentStep &&
                    "bg-primary text-primary-foreground",
                  step.number > currentStep && "bg-muted text-muted-foreground",
                )}
              >
                {step.number < currentStep ? (
                  <Check className="size-3.5" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  step.number === currentStep
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "mb-4 h-px w-8 transition-colors",
                  step.number < currentStep ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

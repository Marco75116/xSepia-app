import { ActiveStrategies } from "@/components/ActiveStrategies";
import { DcaForm } from "@/components/DcaForm";
import { PageHeader } from "@/components/PageHeader";

export default function DcaPage() {
  return (
    <>
      <PageHeader
        title="Dollar Cost Averaging"
        description="Set up automated recurring investments"
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DcaForm />
        <ActiveStrategies />
      </div>
    </>
  );
}

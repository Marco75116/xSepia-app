import { BasketCard } from "@/components/BasketCard";
import { CreateBasketDialog } from "@/components/CreateBasketDialog";
import { PageHeader } from "@/components/PageHeader";
import { BASKETS } from "@/lib/data";

export default function BasketsPage() {
  return (
    <>
      <PageHeader
        title="Baskets"
        description="Create and manage custom stock baskets"
        action={<CreateBasketDialog />}
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {BASKETS.map((basket) => (
          <BasketCard key={basket.id} basket={basket} />
        ))}
      </div>
    </>
  );
}

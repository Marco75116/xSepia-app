import { PageHeader } from "@/components/PageHeader";
import { StockCard } from "@/components/StockCard";
import { STOCKS } from "@/lib/data";

export default function AssetsPage() {
  return (
    <>
      <PageHeader
        title="Assets"
        description="Browse tokenized stocks available on xStocks"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STOCKS.map((stock) => (
          <StockCard key={stock.ticker} stock={stock} />
        ))}
      </div>
    </>
  );
}

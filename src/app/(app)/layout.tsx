import { BottomTabBar } from "@/components/BottomTabBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-24 pt-6">
        {children}
      </main>
      <BottomTabBar />
    </>
  );
}

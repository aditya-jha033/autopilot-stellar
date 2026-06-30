import Sidebar from "./Sidebar";

export default function DashboardShell({
  children,
  publicKey,
}: {
  children: React.ReactNode;
  publicKey: string;
}) {
  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar publicKey={publicKey} />
      {/* offset for desktop sidebar, add bottom padding for mobile nav */}
      <main className="flex-1 md:ml-64 min-h-screen pb-16 md:pb-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

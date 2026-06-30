import DashboardShell from "@/components/DashboardShell";
import AccountClient from "./AccountClient";
import { getSession } from "@/lib/session";

export default async function AccountPage() {
  const session = await getSession();

  return (
    <DashboardShell publicKey={session.publicKey}>
      <AccountClient publicKey={session.publicKey} />
    </DashboardShell>
  );
}

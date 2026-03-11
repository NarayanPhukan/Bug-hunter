// app/dashboard/layout.tsx
import { auth }       from "@/auth";
import { redirect }   from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/");

  return (
    <DashboardShell session={session}>
      {children}
    </DashboardShell>
  );
}

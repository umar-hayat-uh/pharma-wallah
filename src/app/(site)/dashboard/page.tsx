// src/app/(site)/dashboard/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useProgress } from "@/hooks/useProgress";
import { createClient } from "@/lib/supabase";
import { DashboardErrorBoundary } from "@/components/dashboard/DashboardErrorBoundary";
import { DashboardView } from "@/components/dashboard/DashboardView";

/*
 * Data wiring only. Everything visible lives in DashboardView, which takes the
 * session and progress as props — so the whole page can be rendered from
 * fixtures when verifying a change without a real account.
 */
function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useSupabaseUser();
  const progress = useProgress();

  const signOut = async () => {
    await createClient().auth.signOut();
    router.replace("/");
    router.refresh();
  };

  return <DashboardView user={user} authLoading={authLoading} progress={progress} onSignOut={signOut} />;
}

export default function DashboardPage() {
  return (
    <DashboardErrorBoundary>
      <Dashboard />
    </DashboardErrorBoundary>
  );
}

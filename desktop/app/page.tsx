import { Dashboard } from "./_components/Dashboard";

// The desktop app opens on its own dashboard — there is no marketing home
// screen inside the installer.
export default function HomePage() {
  return <Dashboard />;
}

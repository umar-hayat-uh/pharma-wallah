/*
 * Shown while the dashboard's JavaScript is on its way. It is the dashboard's
 * own frame — board colour, rail, top bar, the first two panels — so the real
 * page replaces it in place instead of flashing the site-wide loader.
 * Plain markup and Tailwind only: dashboard.css is not loaded yet here.
 */
export default function DashboardLoading() {
  return (
    <div className="min-h-[100svh] bg-[#f8f8f5]" aria-busy="true" aria-label="Loading your dashboard">
      <div className="fixed inset-y-0 left-0 hidden w-[256px] border-r border-[#16181d]/[0.09] lg:block" />
      <div className="lg:pl-[256px]">
        <div className="h-[64px] border-b border-[#16181d]/[0.09]" />
        <div className="mx-auto max-w-[1240px] animate-pulse px-4 sm:px-8 motion-reduce:animate-none">
          <div className="mt-12 h-3 w-40 rounded bg-[#16181d]/[0.06]" />
          <div className="mt-6 h-16 w-3/4 max-w-xl rounded-xl bg-[#16181d]/[0.06]" />
          <div className="mt-3 h-16 w-1/2 max-w-md rounded-xl bg-[#16181d]/[0.06]" />
          <div className="mt-10 grid gap-5 lg:grid-cols-12">
            <div className="h-[360px] rounded-[24px] bg-[#1c7bd9]/[0.14] lg:col-span-7" />
            <div className="h-[360px] rounded-[20px] bg-[#16181d]/[0.05] lg:col-span-5" />
          </div>
        </div>
      </div>
    </div>
  );
}

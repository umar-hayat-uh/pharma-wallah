"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * shadcn Tabs, without @radix-ui/react-tabs — no new dependency in a bundle that
 * ships inside the APK. Same composition API (Tabs / TabsList / TabsTrigger /
 * TabsContent), controlled or uncontrolled, and the WAI-ARIA tabs pattern:
 * roving tabindex, ←/→/Home/End, and aria-controls wiring.
 *
 * Typical calculator use: switching between equations (CKD-EPI vs MDRD) or
 * between modes (mass ↔ molarity).
 */
type TabsCtx = {
  value: string;
  setValue: (v: string) => void;
  baseId: string;
};

const TabsContext = React.createContext<TabsCtx | null>(null);

function useTabs(component: string) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error(`<${component}> must be rendered inside <Tabs>.`);
  return ctx;
}

function Tabs({
  value: controlled,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}: Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "");
  const value = controlled ?? uncontrolled;
  const baseId = React.useId();

  const setValue = React.useCallback(
    (next: string) => {
      if (controlled === undefined) setUncontrolled(next);
      onValueChange?.(next);
    },
    [controlled, onValueChange],
  );

  return (
    <TabsContext.Provider value={{ value, setValue, baseId }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, onKeyDown, ...props }, ref) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
      if (!keys.includes(event.key)) return;
      const tabs = Array.from(
        event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'),
      );
      const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
      if (index === -1) return;
      event.preventDefault();
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? tabs.length - 1
            : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next]?.focus();
      tabs[next]?.click();
    };

    return (
      <div
        ref={ref}
        role="tablist"
        onKeyDown={handleKeyDown}
        className={cn(
          "inline-flex w-full items-center gap-1 rounded-xl bg-muted p-1 text-muted-foreground sm:w-auto",
          className,
        )}
        {...props}
      />
    );
  },
);
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, onClick, ...props }, ref) => {
  const ctx = useTabs("TabsTrigger");
  const selected = ctx.value === value;

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={`${ctx.baseId}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${ctx.baseId}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      data-state={selected ? "active" : "inactive"}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) ctx.setValue(value);
      }}
      className={cn(
        // 40px tall inside a 48px list: still a comfortable thumb target.
        "inline-flex h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 text-sm font-medium",
        "transition-[color,background-color,box-shadow] duration-300 ease-out-expo",
        "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50 sm:flex-none",
        "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        className,
      )}
      {...props}
    />
  );
});
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string;
    /**
     * Keep the panel mounted (hidden) while inactive, as Radix's `forceMount`
     * does — for a panel holding work the user would lose on unmount, such as
     * the TLC analyzer's loaded plate.
     */
    forceMount?: boolean;
  }
>(({ className, value, forceMount, ...props }, ref) => {
  const ctx = useTabs("TabsContent");
  const active = ctx.value === value;
  if (!active && !forceMount) return null;

  return (
    <div
      ref={ref}
      role="tabpanel"
      hidden={!active}
      id={`${ctx.baseId}-panel-${value}`}
      aria-labelledby={`${ctx.baseId}-tab-${value}`}
      tabIndex={0}
      className={cn("mt-4 focus-visible:outline-none animate-calc-result", className)}
      {...props}
    />
  );
});
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };

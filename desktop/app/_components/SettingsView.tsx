"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { NumberField } from "@/components/calculators";
import { PageHeader, Panel, useToast } from "./parts";
import { ALL_SLUGS } from "../_data/catalog";
import { VALUES } from "../_data/values";
import { allFormulas } from "../_data/formulas";
import {
  DEFAULT_SETTINGS,
  clearHistory,
  getHistory,
  getSettings,
  setSettings,
  storageLocation,
  subscribe,
  type Settings,
} from "../_lib/store";
import { isTauri } from "../_lib/bridge";

/**
 * Settings, and the honest "what this application is" page.
 *
 * The second half matters as much as the first: a student should be able to
 * find out, from inside the program, exactly where their data lives, what the
 * application does and does not do, and what it is not safe to use it for.
 */
export function SettingsView() {
  const [settings, setLocal] = useState<Settings | null>(null);
  const [limit, setLimit] = useState("");
  const [count, setCount] = useState(0);
  const [where, setWhere] = useState("…");
  const [confirmClear, setConfirmClear] = useState(false);
  const { flash, toast } = useToast();

  useEffect(() => {
    let live = true;
    const sync = () => {
      void getSettings().then((value) => {
        if (!live) return;
        setLocal(value);
        setLimit(String(value.historyLimit));
      });
      void getHistory().then((entries) => {
        if (live) setCount(entries.length);
      });
    };
    sync();
    void storageLocation().then((value) => {
      if (live) setWhere(value);
    });
    const unsubscribe = subscribe(sync);
    return () => {
      live = false;
      unsubscribe();
    };
  }, []);

  const limitValue = Number(limit.trim());
  const limitInvalid =
    limit.trim() === "" || !Number.isFinite(limitValue) || limitValue < 10 || limitValue > 5000;

  return (
    <div className="mx-auto w-full max-w-4xl px-8 py-8">
      <PageHeader
        eyebrow="Settings"
        title="Settings & about"
        lead="Everything this application stores, stores on this computer."
      />

      <div className="space-y-5">
        <Panel>
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
            Calculation history
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            {count === 0
              ? "Nothing is saved yet."
              : `${count} saved ${count === 1 ? "calculation" : "calculations"}.`}{" "}
            Stored in {where}.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Keep at most"
              value={limit}
              onChange={setLimit}
              unit="entries"
              min={10}
              max={5000}
              hint="Between 10 and 5000. The oldest are dropped past this."
              error={limitInvalid && limit.trim() !== "" ? "Enter a number between 10 and 5000." : undefined}
            />
            <div className="flex items-end">
              <Button
                variant="outline"
                disabled={limitInvalid || settings?.historyLimit === limitValue}
                onClick={() => {
                  void setSettings({ historyLimit: limitValue }).then(() =>
                    flash("History limit saved."),
                  );
                }}
              >
                Save limit
              </Button>
            </div>
          </div>

          <label className="mt-4 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={settings?.confirmBeforeDelete ?? DEFAULT_SETTINGS.confirmBeforeDelete}
              onChange={(event) => {
                void setSettings({ confirmBeforeDelete: event.target.checked });
              }}
              className="mt-0.5 h-4 w-4 rounded border-input accent-[hsl(var(--primary))]"
            />
            <span className="text-[13px] leading-relaxed text-foreground">
              Ask before deleting a single saved calculation
              <span className="mt-0.5 block text-muted-foreground">
                Deleting everything always asks, whatever this is set to.
              </span>
            </span>
          </label>

          <div className="mt-5 border-t border-border/70 pt-4">
            {confirmClear ? (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[13px] font-medium text-foreground">
                  Delete all {count} saved calculations? This cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    void clearHistory().then(() => flash("History cleared."));
                    setConfirmClear(false);
                  }}
                >
                  Delete all
                </Button>
                <Button variant="outline" size="sm" onClick={() => setConfirmClear(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" disabled={count === 0} onClick={() => setConfirmClear(true)}>
                Clear all history
              </Button>
            )}
          </div>
        </Panel>

        <Panel>
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
            What this application contains
          </h2>
          <dl className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
            <Row label="Calculators" value={String(ALL_SLUGS.length)} />
            <Row label="Reference values" value={String(VALUES.length)} />
            <Row label="Formulas" value={String(allFormulas().length)} />
            <Row label="Runtime" value={isTauri() ? "Windows desktop (Tauri)" : "Browser (development)"} />
          </dl>
        </Panel>

        <Panel>
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
            Privacy and connectivity
          </h2>
          <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-muted-foreground">
            <li>
              <strong className="text-foreground">Nothing leaves this computer.</strong> There is no
              account, no sign-in, no cloud database and no analytics. The application makes no
              network requests at all — the calculators, the values library and the fonts are all
              packaged inside it.
            </li>
            <li>
              <strong className="text-foreground">Saved calculations are a plain file.</strong> They
              live in {where}, readable and deletable by you, and are not shared with any other
              user of this computer.
            </li>
            <li>
              <strong className="text-foreground">Reference links do not open.</strong> Several
              calculators cite FDA labels and journal articles. This application has no permission
              to launch a browser, so clicking one copies the address instead.
            </li>
          </ul>
        </Panel>

        <Panel className="border-destructive/30 bg-destructive/5">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
            Educational use only
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            PharmaWallah is a teaching tool for pharmacy students. Every figure it produces must be
            checked against your own reference before it is used for a patient, and a number this
            application shows is never on its own a reason to give, withhold or change a dose. The
            reference values it holds are teaching values: each one states where it came from, and a
            value it could not source is left out rather than guessed.
          </p>
        </Panel>
      </div>

      {toast}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 py-1.5">
      <dt className="text-[13px] text-muted-foreground">{label}</dt>
      <dd className="text-[14px] font-semibold tabular-nums text-foreground">{value}</dd>
    </div>
  );
}

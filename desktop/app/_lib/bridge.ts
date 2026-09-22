/**
 * The only place the desktop frontend talks to Rust.
 *
 * Deliberately uses Tauri's *global* bridge (`window.__TAURI__`, enabled by
 * `app.withGlobalTauri` in src-tauri/tauri.conf.json) rather than the
 * `@tauri-apps/api` npm package. Two reasons:
 *
 *  1. The desktop bundle then needs no new npm dependency at all, so the
 *     frontend stays byte-for-byte the same modules the website already ships.
 *  2. The same build runs in a plain browser during development and
 *     verification — `isTauri()` is false there and every caller falls back to
 *     localStorage, so the UI can be exercised without compiling Rust.
 *
 * Nothing here touches the network. `invoke` is an IPC call into the local
 * process; there is no HTTP anywhere in this file.
 */

type Invoke = (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;

type TauriGlobal = {
  core?: { invoke?: Invoke };
  invoke?: Invoke;
};

function tauri(): TauriGlobal | null {
  if (typeof window === "undefined") return null;
  const global = (window as unknown as { __TAURI__?: TauriGlobal }).__TAURI__;
  return global ?? null;
}

/** True only inside the packaged desktop application. */
export function isTauri(): boolean {
  const global = tauri();
  return Boolean(global?.core?.invoke ?? global?.invoke);
}

/**
 * Calls a Rust command. Returns null when not running under Tauri, or when the
 * command fails — every caller has a browser fallback, so a failure here must
 * degrade the feature, never take the window down (the same "caches fail open"
 * rule the website follows).
 */
export async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T | null> {
  const global = tauri();
  const fn = global?.core?.invoke ?? global?.invoke;
  if (!fn) return null;
  try {
    return (await fn(cmd, args)) as T;
  } catch (error) {
    // eslint-disable-next-line no-console -- the only diagnostic channel in a packaged app
    console.warn(`[pharmawallah] command "${cmd}" failed:`, error);
    return null;
  }
}

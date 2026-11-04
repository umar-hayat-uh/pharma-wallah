import { UNAVAILABLE_MESSAGE } from "@/lib/services";

/**
 * A stand-in Supabase client for a deployment without Supabase keys (2026-11-04).
 *
 * Every page reads the visitor's session (the header's sign-in button), so a
 * missing key used to break the whole site, not just the features that need a
 * database. This object has the same shape as a real client, and:
 *   - auth reads report a signed-out visitor (no error, so nothing shows a red banner);
 *   - sign-in, sign-up and every other auth action return UNAVAILABLE_MESSAGE as the error;
 *   - every query chain — `.from(…).select(…).eq(…)`, `.rpc(…)`, storage — resolves to
 *     `{ data: null, error: { message: UNAVAILABLE_MESSAGE } }`, the shape callers already handle;
 *   - realtime channels subscribe to nothing.
 */
const error = {
  message: UNAVAILABLE_MESSAGE,
  name: "ServiceUnavailable",
  code: "SERVICE_UNAVAILABLE",
  status: 503,
  details: "",
  hint: "",
};
const failed = { data: null, error, count: null, status: 503, statusText: "Service Unavailable" };

/** A callable, chainable, awaitable no-op: any property or call returns itself; awaiting it yields `failed`. */
function chain(): unknown {
  const target = function () {};
  const proxy: unknown = new Proxy(target, {
    get(_t, prop) {
      if (prop === "then") {
        return (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
          Promise.resolve(failed).then(resolve, reject);
      }
      if (prop === Symbol.toPrimitive) return () => "[supabase unavailable]";
      return proxy;
    },
    apply() {
      return proxy;
    },
  });
  return proxy;
}

const signedOut = { data: { user: null, session: null }, error: null };
const authFailed = { data: { user: null, session: null }, error };

const auth = new Proxy(
  {
    getUser: async () => signedOut,
    getSession: async () => signedOut,
    getClaims: async () => ({ data: null, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    signOut: async () => ({ error: null }),
    stopAutoRefresh: async () => {},
    startAutoRefresh: async () => {},
  } as Record<string | symbol, unknown>,
  {
    // Any other auth method (signInWithPassword, signUp, verifyOtp,
    // resetPasswordForEmail, updateUser, exchangeCodeForSession, …).
    get: (known, prop) => known[prop] ?? (async () => authFailed),
  },
);

export function unavailableSupabase<T>(): T {
  return new Proxy(
    { auth } as Record<string | symbol, unknown>,
    {
      get(known, prop) {
        if (prop in known) return known[prop];
        if (prop === "then") return undefined; // the client itself is not a promise
        if (prop === "channel") return () => chain();
        if (prop === "removeChannel" || prop === "removeAllChannels") return async () => "ok";
        return chain();
      },
    },
  ) as T;
}

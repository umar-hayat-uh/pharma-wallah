/**
 * Node resolve hook for scripts that import app TypeScript modules which import
 * each other extensionlessly (`from "./graph"`), the way webpack/tsc expect.
 * Node's type stripping needs the `.ts` extension, so it is added here. The
 * project's `@/*` path alias (tsconfig `paths`) is resolved to `src/*` for the
 * same reason — a pure module under test may import a sibling kit module that
 * way.
 *
 *   import { register } from "node:module";
 *   register("./lib/ts-resolve.mjs", import.meta.url);
 *   const { analyse } = await import("../src/components/molecular-lab/graph.ts");
 */
const SRC = new URL("../../src/", import.meta.url).href;

export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const target = `${SRC}${specifier.slice(2)}`;
    if (!/\.[cm]?[jt]sx?$|\.json$/.test(target)) {
      try {
        return await next(`${target}.ts`, context);
      } catch {
        return next(`${target}.tsx`, context);
      }
    }
    return next(target, context);
  }
  if ((specifier.startsWith("./") || specifier.startsWith("../")) && !/\.[cm]?[jt]sx?$|\.json$/.test(specifier)) {
    try {
      return await next(`${specifier}.ts`, context);
    } catch {
      // fall through to the default resolution
    }
  }
  return next(specifier, context);
}

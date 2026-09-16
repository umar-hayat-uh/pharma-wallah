/**
 * Node resolve hook for scripts that import app TypeScript modules which import
 * each other extensionlessly (`from "./graph"`), the way webpack/tsc expect.
 * Node's type stripping needs the `.ts` extension, so it is added here.
 *
 *   import { register } from "node:module";
 *   register("./lib/ts-resolve.mjs", import.meta.url);
 *   const { analyse } = await import("../src/components/molecular-lab/graph.ts");
 */
export async function resolve(specifier, context, next) {
  if ((specifier.startsWith("./") || specifier.startsWith("../")) && !/\.[cm]?[jt]sx?$|\.json$/.test(specifier)) {
    try {
      return await next(`${specifier}.ts`, context);
    } catch {
      // fall through to the default resolution
    }
  }
  return next(specifier, context);
}

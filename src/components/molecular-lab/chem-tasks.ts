import type { MolGraph } from "./graph";
import type { Conformer3D } from "./molfile";
import type { CommonResult, OCL } from "./chem-core";

/**
 * The message protocol shared by the worker and the main-thread fallback. One
 * dispatcher, so both paths run exactly the same code.
 */

export type ChemRequest =
  | { id: number; kind: "smiles"; smiles: string }
  | { id: number; kind: "molfile"; text: string }
  | { id: number; kind: "layout"; graph: MolGraph }
  | { id: number; kind: "conformer"; graph: MolGraph; seed?: number }
  | { id: number; kind: "to-smiles"; graph: MolGraph }
  | { id: number; kind: "common"; a: MolGraph; b: MolGraph };

export type ChemResult =
  | { kind: "loaded"; graph: MolGraph; conformer: Conformer3D | null }
  | { kind: "graph"; graph: MolGraph }
  | { kind: "conformer"; conformer: Conformer3D; minimised: boolean }
  | { kind: "text"; text: string }
  | { kind: "common"; common: CommonResult };

export type ChemResponse =
  | ({ id: number; ok: true } & { result: ChemResult })
  | { id: number; ok: false; code: string; message: string };

// The conformer generator's torsion library and the MMFF94 tables (1.35 MB).
// A relative path, because openchemlib's package "exports" does not list the
// file and webpack refuses the bare specifier.
const RESOURCES_URL = new URL("../../../node_modules/openchemlib/dist/resources.json", import.meta.url).href;

let oclPromise: Promise<OCL> | null = null;
let resourcesPromise: Promise<void> | null = null;

function loadOcl(): Promise<OCL> {
  if (!oclPromise) {
    oclPromise = import("openchemlib").then((m) => m as unknown as OCL);
    oclPromise.catch(() => {
      oclPromise = null;
    });
  }
  return oclPromise;
}

function loadResources(ocl: OCL): Promise<void> {
  if (!resourcesPromise) {
    resourcesPromise = ocl.Resources.registerFromUrl(RESOURCES_URL);
    resourcesPromise.catch(() => {
      resourcesPromise = null;
    });
  }
  return resourcesPromise;
}

export async function runChemTask(req: ChemRequest): Promise<ChemResponse> {
  try {
    const [ocl, core] = await Promise.all([loadOcl(), import("./chem-core")]);
    let result: ChemResult;
    switch (req.kind) {
      case "smiles": {
        const out = core.fromSmiles(ocl, req.smiles);
        result = { kind: "loaded", ...out };
        break;
      }
      case "molfile": {
        const out = core.fromMolfile(ocl, req.text);
        result = { kind: "loaded", graph: out.graph, conformer: out.conformer };
        break;
      }
      case "layout":
        result = { kind: "graph", graph: core.layout2D(ocl, req.graph) };
        break;
      case "conformer": {
        await loadResources(ocl);
        const out = core.generateConformer(ocl, req.graph, req.seed);
        result = { kind: "conformer", ...out };
        break;
      }
      case "to-smiles":
        result = { kind: "text", text: core.toSmiles(ocl, req.graph) };
        break;
      case "common":
        result = { kind: "common", common: core.commonSubstructure(ocl, req.a, req.b) };
        break;
    }
    return { id: req.id, ok: true, result };
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? String((err as { code: unknown }).code) : "failed";
    const message = err instanceof Error ? err.message : "The chemistry engine could not process this structure.";
    return { id: req.id, ok: false, code, message };
  }
}

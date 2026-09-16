import type { MolGraph } from "./graph";
import type { Conformer3D } from "./molfile";
import type { CommonResult } from "./chem-core";
import type { ChemRequest, ChemResponse, ChemResult } from "./chem-tasks";

/**
 * The page's side of the chemistry engine. Prefers the Web Worker; if it
 * cannot start (an old browser, a blocked chunk) the same dispatcher runs on
 * the main thread. OpenChemLib is only downloaded the first time a structure
 * is loaded, laid out, exported as SMILES or shown in 3D.
 */

export class ChemFailure extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

let worker: Worker | null = null;
let workerBroken = false;
let nextId = 1;

function getWorker(): Worker | null {
  if (workerBroken || typeof Worker === "undefined") return null;
  if (worker) return worker;
  try {
    worker = new Worker(new URL("./chem.worker.ts", import.meta.url));
    return worker;
  } catch {
    workerBroken = true;
    return null;
  }
}

type WithoutId<T> = T extends unknown ? Omit<T, "id"> : never;

function viaWorker(w: Worker, req: ChemRequest): Promise<ChemResponse> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("worker-timeout"));
    }, 60000);
    const cleanup = () => {
      window.clearTimeout(timer);
      w.removeEventListener("message", onMessage);
      w.removeEventListener("error", onError);
    };
    const onMessage = (event: MessageEvent<ChemResponse>) => {
      if (event.data.id !== req.id) return;
      cleanup();
      resolve(event.data);
    };
    const onError = () => {
      cleanup();
      reject(new Error("worker-error"));
    };
    w.addEventListener("message", onMessage);
    w.addEventListener("error", onError);
    w.postMessage(req);
  });
}

async function run(request: WithoutId<ChemRequest>): Promise<ChemResult> {
  const req = { ...request, id: nextId++ } as ChemRequest;
  let res: ChemResponse | null = null;
  const w = getWorker();
  if (w) {
    try {
      res = await viaWorker(w, req);
    } catch {
      // A worker that errors or never answers is retired for the session.
      workerBroken = true;
      w.terminate();
      worker = null;
    }
  }
  if (!res) {
    const { runChemTask } = await import("./chem-tasks");
    res = await runChemTask(req);
  }
  if (!res.ok) throw new ChemFailure(res.code, res.message);
  return res.result;
}

export async function loadSmiles(smiles: string) {
  const r = await run({ kind: "smiles", smiles });
  if (r.kind !== "loaded") throw new ChemFailure("failed", "Unexpected engine reply.");
  return r;
}

export async function loadMolfile(text: string) {
  const r = await run({ kind: "molfile", text });
  if (r.kind !== "loaded") throw new ChemFailure("failed", "Unexpected engine reply.");
  return r;
}

export async function cleanLayout(graph: MolGraph): Promise<MolGraph> {
  const r = await run({ kind: "layout", graph });
  if (r.kind !== "graph") throw new ChemFailure("failed", "Unexpected engine reply.");
  return r.graph;
}

export async function makeConformer(graph: MolGraph): Promise<{ conformer: Conformer3D; minimised: boolean }> {
  const r = await run({ kind: "conformer", graph });
  if (r.kind !== "conformer") throw new ChemFailure("failed", "Unexpected engine reply.");
  return r;
}

export async function smilesOf(graph: MolGraph): Promise<string> {
  const r = await run({ kind: "to-smiles", graph });
  if (r.kind !== "text") throw new ChemFailure("failed", "Unexpected engine reply.");
  return r.text;
}

export async function commonOf(a: MolGraph, b: MolGraph): Promise<CommonResult> {
  const r = await run({ kind: "common", a, b });
  if (r.kind !== "common") throw new ChemFailure("failed", "Unexpected engine reply.");
  return r.common;
}

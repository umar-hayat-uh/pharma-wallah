import { runChemTask, type ChemRequest, type ChemResponse } from "./chem-tasks";

/**
 * Runs OpenChemLib off the main thread. Conformer generation for a drug-sized
 * molecule takes a second or more on a phone; here it never blocks drawing.
 * Bundled by webpack as a local chunk (no CDN); the conformer data file is
 * fetched from our own origin the first time 3D is needed.
 */

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<ChemRequest>) => void) | null;
  postMessage: (message: ChemResponse) => void;
};

scope.onmessage = async (event) => {
  const req = event.data;
  scope.postMessage(await runChemTask(req));
};

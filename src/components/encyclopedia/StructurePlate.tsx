"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { ArrowUpRight, Atom } from "lucide-react";

/*
 * The structure plate in a monograph's masthead: the 2D depiction, a 3D model
 * the reader can spin, and a hand-off to the Molecular Lab.
 *
 * The 3D half is `next/dynamic` with `ssr: false` and is only mounted once the
 * reader presses "3D" — OpenChemLib (~1 MB + a 1.35 MB resource file) and
 * 3Dmol (~578 KB) must never land on a page whose job is search.
 */
const Structure3D = dynamic(() => import("./Structure3D"), {
  ssr: false,
  loading: () => (
    <div className="pw-enc-3d">
      <div className="pw-enc-3d__stage">
        <div className="pw-enc-3d__wait" role="status">
          <span className="pw-enc-3d__spinner" aria-hidden="true" />
          <p>Loading the 3D engine</p>
        </div>
      </div>
    </div>
  ),
});

export default function StructurePlate({
  smiles,
  name,
  molKey,
}: {
  smiles: string;
  name: string;
  /** Stable per drug, so switching drugs rebuilds the model rather than re-fitting the old one. */
  molKey: string;
}) {
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [seen3d, setSeen3d] = useState(false);
  const [imgStatus, setImgStatus] = useState<"loading" | "ok" | "error">("loading");

  const src = `https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(smiles)}/image?format=png&width=520&height=520&bgcolor=white`;
  const labHref = `/molecular-lab?smiles=${encodeURIComponent(smiles)}&name=${encodeURIComponent(name)}`;

  return (
    <figure className="pw-enc-plate">
      <div className="pw-enc-plate__switch" role="group" aria-label="Structure view">
        <button
          type="button"
          data-on={mode === "2d" || undefined}
          aria-pressed={mode === "2d"}
          onClick={() => setMode("2d")}
        >
          2D
        </button>
        <button
          type="button"
          data-on={mode === "3d" || undefined}
          aria-pressed={mode === "3d"}
          onClick={() => {
            setMode("3d");
            setSeen3d(true);
          }}
        >
          3D
        </button>
      </div>

      <div className="pw-enc-plate__frame" data-mode={mode} data-status={imgStatus}>
        <div className="pw-enc-plate__pane" hidden={mode !== "2d"}>
          {imgStatus !== "error" && (
            // A plain <img>: an external, on-demand render; next/image would
            // need the host in remotePatterns and would proxy it through us.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={`2D chemical structure of ${name}`}
              width={520}
              height={520}
              loading="lazy"
              decoding="async"
              onLoad={() => setImgStatus("ok")}
              onError={() => setImgStatus("error")}
            />
          )}
          {imgStatus === "loading" && <span className="pw-enc-plate__wait" aria-hidden="true" />}
          {imgStatus === "error" && (
            <p className="pw-enc-plate__error">
              The 2D depiction service didn&rsquo;t answer.
              <br />
              Try the 3D model, or read the SMILES under Chemistry.
            </p>
          )}
        </div>

        {/* Kept mounted once opened, so flipping back to 3D doesn't rebuild the conformer. */}
        {seen3d && (
          <div className="pw-enc-plate__pane" hidden={mode !== "3d"}>
            <Structure3D smiles={smiles} name={name} molKey={molKey} />
          </div>
        )}
      </div>

      <figcaption>
        <span>
          {mode === "2d" ? (
            <>
              2D structure ·{" "}
              <a href="https://cactus.nci.nih.gov" target="_blank" rel="noopener noreferrer">
                NIH CACTUS
              </a>
            </>
          ) : (
            <>3D conformer · generated on this device</>
          )}
        </span>
        <a className="pw-enc-plate__lab" href={labHref}>
          <Atom className="h-3.5 w-3.5" aria-hidden="true" />
          Open in Molecular Lab
          <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
        </a>
      </figcaption>
    </figure>
  );
}

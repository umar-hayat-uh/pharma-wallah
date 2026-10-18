"use client";

/**
 * A joint's model (bones + ligaments + capsule + discs, all real Z-Anatomy meshes) with
 * its structures listed beside it. Choosing a bone, ligament or disc — in the list or by
 * tapping the model — highlights that mesh and fades the rest; the capsule can be hidden
 * to see the ligaments and surfaces inside it.
 */
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { JointContent, JointStructure } from "@/lib/osteology/types";
import type { ModelPart } from "@/lib/osteology/models";
import { jointViews } from "@/lib/osteology/views";
import { ModelViewer } from "./viewer/ModelViewer";

type Item = { key: string; name: string; zName?: string; group: string; detail?: JointStructure; boneSlug?: string };

type Props = {
  joint: Pick<JointContent, "slug" | "name" | "bones" | "special" | "ligaments">;
  modelSrc: string;
  modelSize: string;
  parts: ModelPart[];
};

export function JointExplorer({ joint, modelSrc, modelSize, parts }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hideCapsule, setHideCapsule] = useState(false);
  const meshNames = useMemo(() => new Set(parts.map((p) => p.name)), [parts]);
  const capsules = parts.filter((p) => p.kind === "Capsule").map((p) => p.name);

  const items: Item[] = useMemo(
    () => [
      ...joint.bones.map((b) => ({ key: `b:${b.name}`, name: b.name, zName: b.zName, group: "Bones", boneSlug: b.slug })),
      ...joint.special.map((s) => ({ key: `s:${s.name}`, name: s.name, zName: s.zName, group: "Special structures", detail: s })),
      ...joint.ligaments.map((s) => ({ key: `l:${s.name}`, name: s.name, zName: s.zName, group: "Ligaments", detail: s })),
    ],
    [joint],
  );
  const byZ = useMemo(() => new Map(items.filter((i) => i.zName).map((i) => [i.zName!, i])), [items]);
  const current = items.find((i) => i.key === selected) ?? null;
  const selectedMesh = current?.zName && meshNames.has(current.zName) ? current.zName : null;
  // A mesh in the model that the lesson does not list (a neighbouring bone kept for context).
  const [contextMesh, setContextMesh] = useState<string | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
      <div className="min-w-0 lg:sticky lg:top-24">
        <ModelViewer
          src={modelSrc}
          sizeLabel={modelSize}
          views={jointViews(joint.slug)}
          selectableParts
          focusSelected
          selectedPart={selectedMesh ?? contextMesh}
          onSelectPart={(name) => {
            if (!name) {
              setSelected(null);
              setContextMesh(null);
              return;
            }
            const item = byZ.get(name);
            setSelected(item ? item.key : null);
            setContextMesh(item ? null : name);
          }}
          hiddenParts={hideCapsule ? capsules : []}
          dimOthers
          hint="Tap a bone or ligament on the model, or choose one from the list. Hide the capsule to see what lies inside it."
          fallback={<p className="text-sm">Use the structure list to study the joint.</p>}
        />
        {capsules.length > 0 && (
          <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium">
            <input type="checkbox" checked={hideCapsule} onChange={(e) => setHideCapsule(e.target.checked)} className="h-5 w-5 accent-[#1c7bd9]" />
            Hide the joint capsule
          </label>
        )}
        {contextMesh && !current && (
          <p className="mt-2 rounded-xl bg-[#f4f7fb] p-3 text-sm" role="status">
            <strong>{contextMesh}</strong> — shown for context; it is not one of the structures this lesson lists for the {joint.name.toLowerCase()}.
          </p>
        )}
      </div>

      <section id="structures" aria-labelledby="structures-title" className="pw-osteo-anchor min-w-0">
        <h2 id="structures-title" className="text-xl font-bold tracking-tight">Structures</h2>
        <p className="mt-1 text-sm text-[#4a4f57]">Choose one to highlight it. Grey dots are taught here but not modelled.</p>
        {["Bones", "Special structures", "Ligaments"].map((group) => {
          const list = items.filter((i) => i.group === group);
          if (list.length === 0) return null;
          return (
            <div key={group} className="mt-4">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#6b7079]">{group}</h3>
              <ul className="pw-osteo-list mt-2 divide-y divide-[#16181d]/8 rounded-2xl border border-[#16181d]/10 bg-white">
                {list.map((i) => {
                  const open = selected === i.key;
                  const modelled = !!(i.zName && meshNames.has(i.zName));
                  return (
                    <li key={i.key}>
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => {
                          setSelected(open ? null : i.key);
                          setContextMesh(null);
                        }}
                        className={cn(
                          "flex min-h-12 w-full items-center gap-3 px-4 py-2.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brandBlue",
                          open && "bg-brandBlue/[0.06]",
                        )}
                      >
                        <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", modelled ? (open ? "bg-brandGreen" : "bg-brandBlue") : "bg-[#16181d]/20")} aria-hidden />
                        <span className="flex-1 font-semibold leading-snug">{i.name}</span>
                        {!modelled && <span className="text-xs text-[#6b7079]">text only</span>}
                      </button>
                      {open && (i.detail || i.boneSlug) && (
                        <div className="space-y-1.5 px-4 pb-4 text-sm leading-relaxed">
                          {i.detail && <p><span className="font-semibold">{group === "Ligaments" ? "Attachments" : "Position"}: </span>{i.detail.attachments}</p>}
                          {i.detail && <p><span className="font-semibold">Role: </span>{i.detail.role}</p>}
                          {i.boneSlug && (
                            <a href={`/osteology-lab/bones/${i.boneSlug}`} className="inline-flex min-h-10 items-center font-semibold text-brandBlue underline underline-offset-2">
                              Open the bone lesson
                            </a>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>
    </div>
  );
}

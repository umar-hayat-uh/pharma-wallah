import React from "react";

/**
 * The rule at the top of each station: the outlined numeral, the ADME stage it
 * maps to, and "STAGE n OF 4" pinned right.
 */
export default function StationTop({ num, label }: { num: string; label: string }) {
  return (
    <div className="st-top" data-anim>
      <span className="num">{num}</span>
      <span className="lbl">{label}</span>
      <span className="stage-of">STAGE {Number(num)} OF 4</span>
    </div>
  );
}

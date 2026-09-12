"use client";

import React from "react";
import { BookOpen, Calculator, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AI_ANSWER, AI_CITATIONS, AI_POINTS, AI_QUESTION } from "./data";

const POINT_ICONS = { book: BookOpen, calc: Calculator, shield: ShieldCheck } as const;

/**
 * The AI guide.
 *
 * The answer is rendered server-side in full — ScrambleTextPlugin clears it and
 * types it back in on entry, so the copy is still in the HTML for a crawler or
 * a reader that never runs the effect. This is the only text effect on the page.
 */
export default function AiGuide() {
  return (
    <section className="ai" id="ai">
      <div className="wrap ai-in">
        <div>
          <Badge variant="outline" className="kicker" data-anim>
            <span className="pip" aria-hidden="true" />
            AI Guide
          </Badge>

          <h2 data-lines style={{ marginTop: 22 }}>
            Ask it anything.
            <br />
            It shows its <span className="gt">source</span>.
          </h2>

          <p className="lede" data-anim>
            Trained on the curriculum you actually study, not the open internet. It explains
            mechanisms, compares drug classes and walks through calculations line by line.
          </p>

          <div className="aipts">
            {AI_POINTS.map((p) => {
              const Icon = POINT_ICONS[p.icon];
              return (
                <div className="aipt" data-anim key={p.title}>
                  <span className="i">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
                  </span>
                  <span>
                    <b>{p.title}</b>
                    <small>{p.body}</small>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="term" data-anim data-term>
          <div className="bar">
            <i aria-hidden="true" />
            <i aria-hidden="true" />
            <i aria-hidden="true" />
            <span style={{ marginLeft: 8 }}>pharmawallah · ai-guide</span>
          </div>
          <div className="body">
            <span className="ask" data-ask>
              {AI_QUESTION}
            </span>
            <div className="ans">
              <span data-scramble>{AI_ANSWER}</span>
            </div>
            <div className="cite" data-cite>
              {AI_CITATIONS.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
          </div>
          <div className="in">
            Ask about a drug, mechanism or calculation
            <span className="caret" data-caret aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}

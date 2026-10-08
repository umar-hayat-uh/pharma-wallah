import { CalculatorGuide, type GuideFacts } from "@/components/calculator-guide";
import { GROUPS, TOTAL } from "../_data/catalogue";

/**
 * The calculator guide inside the apps (Android, iOS, and any target that
 * exports `mobile/`). Lives here rather than under `calculation-tools/`, because
 * `scripts/generate-mobile-routes.mjs` deletes every folder in that directory
 * on each build. MobileShell gives it an app bar with a back arrow.
 */
const FACTS: GuideFacts = {
  platform: "app",
  toolCount: TOTAL,
  // Home's hash routes: "#cat/<id>" opens that category's list (ToolHub).
  categories: GROUPS.map((g) => ({ id: g.id, label: g.label, href: `/#cat/${g.id}` })),
  hubHref: "/",
};

export default function HowToUsePage() {
  return <CalculatorGuide facts={FACTS} />;
}

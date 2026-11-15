// MODE B — AI Detective. Wraps the existing AI features (Case 001 investigation + Scam Scanner) unchanged.
import type { Mode } from "../../shared/types";
import { ModeBadge } from "../components/ModeBadge";
import { EasyHint, Tip } from "../components/ui";
import { useContext } from "react";
import { VisibleContext } from "../speech";
import { Investigation } from "./Investigation";
import { Scanner } from "./Scanner";

export type DetectiveTab = "case" | "scanner";

export function AiDetective({ tab, setTab, mode }: { tab: DetectiveTab; setTab: (t: DetectiveTab) => void; mode: Mode | "offline" | null }) {
  const visible = useContext(VisibleContext);
  const tabBtn = (t: DetectiveTab, label: string) => (
    <button
      role="tab"
      aria-selected={tab === t}
      onClick={() => setTab(t)}
      className={`btn !min-h-[48px] ${tab === t ? "bg-violet-500 text-ink-950" : "border border-ink-600 bg-ink-800 text-slate-100 hover:border-violet-400"}`}
    >
      {label}
    </button>
  );
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow !text-violet-400">AI Detective mode</p>
          <p className="flex items-center gap-2 text-lg text-slate-300">
            Investigate with an AI partner.
            <Tip text="The AI reads the message and points out warning signs with its reasons. It can be wrong and can't check phone numbers or links. Always confirm with your bank using the number on your card." />
          </p>
        </div>
        <ModeBadge mode={mode} />
      </div>
      <div role="tablist" aria-label="AI Detective tools" className="flex flex-wrap gap-2">
        {tabBtn("case", "🗂️ Case 001: The Frozen Account")}
        {tabBtn("scanner", "🔎 Scam Scanner")}
      </div>
      <EasyHint>
        {tab === "case"
          ? "Read each message, tap the parts that seem suspicious, then answer the questions. Press “Ask the AI partner” for help."
          : "Copy a message you received, paste it in the box and press “Scan message”. Take out names, account numbers and codes first."}
      </EasyHint>
      {/* Both tabs stay mounted so switching tabs keeps your place. */}
      <div role="tabpanel" hidden={tab !== "case"}>
        <VisibleContext.Provider value={visible && tab === "case"}>
          <Investigation onScanner={() => setTab("scanner")} />
        </VisibleContext.Provider>
      </div>
      <div role="tabpanel" hidden={tab !== "scanner"}>
        <VisibleContext.Provider value={visible && tab === "scanner"}>
          <Scanner />
        </VisibleContext.Provider>
      </div>
    </div>
  );
}

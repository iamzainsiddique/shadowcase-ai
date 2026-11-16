// "Who's playing?" Used in the tutorial and on the Story Game's scam list.
import { AUDIENCES, AUDIENCE_ORDER, type Audience } from "../../shared/audience";
import { useSettings } from "../settings";

export function AudienceChoice({ compact = false }: { compact?: boolean }) {
  const { settings, update } = useSettings();
  const choose = (a: Audience) =>
    // Older adults get Easy View (bigger text, simpler screens) and read-aloud straight away; both can be changed in Display.
    update(a === "older" ? { audience: a, easyMode: true, autoRead: true } : { audience: a });
  return (
    <div role="radiogroup" aria-label="Who's playing?">
      {!compact && <p className="mb-2 font-semibold">👥 Who's playing?</p>}
      <div className="grid gap-2 sm:grid-cols-3">
        {AUDIENCE_ORDER.map((a) => (
          <button
            key={a}
            type="button"
            role="radio"
            aria-checked={settings.audience === a}
            onClick={() => choose(a)}
            className={`btn !min-h-[56px] !justify-start text-left ${settings.audience === a ? "bg-electric-500 text-ink-950" : "border border-ink-600 bg-ink-800"}`}
          >
            <span aria-hidden className="text-2xl">{AUDIENCES[a].icon}</span>
            <span>
              <span className="block font-semibold">{AUDIENCES[a].label}</span>
              <span className="block text-sm opacity-80">{AUDIENCES[a].ages}</span>
            </span>
          </button>
        ))}
      </div>
      {settings.audience && <p className="mt-2 text-sm text-slate-300">{AUDIENCES[settings.audience].why}{settings.audience === "older" ? " Easy View and read-aloud are now on; you can change them in “Aa Display”." : ""}</p>}
    </div>
  );
}

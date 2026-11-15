// Always-visible notice: this is an educational demonstration, not a tool for real situations.
export const DEMO_NOTICE =
  "SHADOWCASE AI is an educational demonstration only. It is not for use in real-life situations and does not give financial, legal or security advice. If something is happening to you for real, contact your bank and official services.";

export function DemoNotice() {
  return (
    <div role="note" aria-label="Demonstration only" className="border-b border-caution/40 bg-caution/10">
      <p className="mx-auto max-w-6xl px-4 py-2 text-sm text-slate-200">
        <strong className="text-caution">⚠️ Demonstration for education only.</strong> Not for real-life situations, and not financial, legal or security advice. For a real problem, contact your bank (number on your card) or official services, such as 159 or Report Fraud on 0300 123 2040 in the UK.
      </p>
    </div>
  );
}

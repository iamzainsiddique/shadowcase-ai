// "If it's happening for real": real UK help, shown on endings and the home page.
// These are real services (checked November 2026). Everything inside the stories is fictional.

export function HelpCard({ compact = false }: { compact?: boolean }) {
  return (
    <section className="card space-y-3 border-safe/50 p-5" aria-labelledby="real-help">
      <p className="eyebrow !text-safe">Real help · UK</p>
      <h3 id="real-help" className="h2 !text-2xl">If this is happening to you for real</h3>
      <ol className="list-decimal space-y-2 pl-6 text-lg">
        <li><strong>Stop.</strong> Hang up, or don't reply. It's fine to be rude to a scammer.</li>
        <li><strong>Call your bank</strong> on the number on the back of your card, as soon as you can. In the UK you can also call <strong>159</strong>, which connects you to the fraud team at many major banks.</li>
        {!compact && (
          <>
            <li><strong>Report it:</strong> Report Fraud (formerly Action Fraud) on <strong>0300 123 2040</strong> or at reportfraud.police.uk (England, Wales and Northern Ireland). In Scotland, call Police Scotland on <strong>101</strong>.</li>
            <li><strong>Scam text?</strong> Forward it to <strong>7726</strong>. It's free and helps networks block it.</li>
          </>
        )}
        <li><strong>Tell someone you trust.</strong> Being scammed is a crime against you, not your fault.</li>
      </ol>
      <p className="text-sm text-slate-400">Outside the UK, contact your bank and your local police. The people, banks and numbers inside the stories are made up; the services on this card are real.</p>
    </section>
  );
}

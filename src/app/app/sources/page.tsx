import Link from 'next/link';

export default function SourcesPage() {
  return (
    <div className="space-y-6 pb-16 max-w-3xl">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-primary">Sources & Credits</h1>
        <p className="text-muted-foreground">Content providers and required attributions for Quran and related text.</p>
      </header>

      <section className="rounded-2xl bg-white p-6 shadow-sm space-y-3">
        <h2 className="text-xl font-bold">Quran Arabic Text</h2>
        <p className="text-sm text-muted-foreground">
          <strong>Tanzil Quran Text</strong> — licensed under <strong>CC BY 3.0</strong>.
        </p>
        <p className="text-sm text-muted-foreground">
          Source: <Link className="text-primary underline" href="https://tanzil.net" target="_blank">tanzil.net</Link>
        </p>
        <p className="text-sm font-medium">
          Note: Quran text must not be altered.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm space-y-3">
        <h2 className="text-xl font-bold">Translations</h2>
        <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
          <li>
            <strong>English:</strong> Translator/provider loaded from <code>QURAN_TRANS_EN_URL</code>.
            Add translator name + source link in deployment notes.
          </li>
          <li>
            <strong>Urdu:</strong> Translator/provider loaded from <code>QURAN_TRANS_UR_URL</code>.
            Add translator name + source link in deployment notes.
          </li>
          <li>
            <strong>Hindi:</strong> Translator/provider loaded from <code>QURAN_TRANS_HI_URL</code>.
            Add translator name + source link in deployment notes.
          </li>
        </ul>
      </section>
    </div>
  );
}

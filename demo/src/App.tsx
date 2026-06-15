const CONFIG_SNIPPET = `import { fonts } from '@pyyupsk/vite-fonts'

export default defineConfig({
  plugins: [
    fonts({
      families: {
        sans: { family: 'Inter', weights: [400, 700] },
        mono: { family: 'JetBrains Mono', weights: [400] },
      },
    }),
  ],
})`

const WEIGHTS: { label: string; value: number; tw: string }[] = [
  { label: 'Regular 400', value: 400, tw: 'font-normal' },
  { label: 'Bold 700', value: 700, tw: 'font-bold' },
]

const FEATURES = [
  { label: 'Self-hosted', desc: 'Fonts served from your own domain — no Google CDN' },
  { label: 'CLS-free', desc: 'Font metrics injected at build time via fontkit' },
  { label: 'Tailwind v4', desc: 'CSS vars synced to --font-sans / --font-mono automatically' },
  { label: 'Zero config', desc: 'One plugin call, no manual @font-face or preload tags' },
]

export default function App() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/9 px-6 py-4 flex items-center gap-3">
        <span className="text-sm font-mono text-accent-text bg-accent-soft px-2 py-0.5 rounded">
          @pyyupsk/vite-fonts
        </span>
        <span className="text-text-muted text-sm">Self-hosted Google Fonts for Vite</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16 flex flex-col gap-16">
        {/* Hero */}
        <section className="flex flex-col gap-4">
          <h1 className="text-5xl font-bold tracking-tight leading-tight m-0">
            Fonts that load fast.
            <br />
            Without the CDN.
          </h1>
          <p className="text-lg text-text-muted m-0 leading-relaxed">
            Drop-in Vite plugin. Self-hosts Google Fonts, eliminates layout shift, and wires up
            Tailwind v4 CSS variables — automatically.
          </p>
        </section>

        {/* Features */}
        <section className="flex flex-col gap-3">
          {FEATURES.map(({ label, desc }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              <div>
                <span className="text-sm font-medium">{label}</span>
                <span className="text-sm text-text-muted"> — {desc}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Font specimen — sans */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-mono text-text-muted uppercase tracking-wider m-0">
              Sans — Inter
            </h2>
            <div className="flex-1 h-px bg-white/9" />
          </div>
          <div className="flex flex-col gap-4">
            {WEIGHTS.map(({ label, value, tw }) => (
              <div key={value} className="flex flex-col gap-1">
                <span className="text-xs text-text-muted font-mono">{label}</span>
                <p className={`text-3xl m-0 font-sans ${tw}`}>
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Font specimen — mono */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-mono text-text-muted uppercase tracking-wider m-0">
              Mono — JetBrains Mono
            </h2>
            <div className="flex-1 h-px bg-white/9" />
          </div>
          <p className="font-mono text-xl m-0 leading-relaxed">
            fonts({'{'} families: {'{'} sans: 'Inter' {'}'} {'}'})
          </p>
        </section>

        {/* Config snippet */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-mono text-text-muted uppercase tracking-wider m-0">
              Setup
            </h2>
            <div className="flex-1 h-px bg-white/9" />
          </div>
          <pre className="font-mono bg-surface-1 border border-white/9 rounded-lg p-5 text-sm text-text-body overflow-x-auto m-0">
            {CONFIG_SNIPPET}
          </pre>
        </section>
      </main>
    </div>
  )
}

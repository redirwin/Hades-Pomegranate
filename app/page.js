export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <header className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Hades Pomegranate
        </h1>
        <p className="text-xl text-foreground/80 mb-8">
          Digital Tools for RPG Gamers
        </p>
      </header>

      <main className="max-w-5xl mx-auto">
        <section className="mb-12">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-6 border rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Lodestone</h2>
              <p className="text-foreground/80 mb-4">
                Create and manage inventory lists for your RPG characters.
              </p>
              <a href="/lodestone" className="text-primary hover:underline">
                Launch Lodestone →
              </a>
            </div>
            {/* Add more tools here as they become available */}
          </div>
        </section>
      </main>
    </div>
  );
}

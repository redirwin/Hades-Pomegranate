import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen p-4 sm:p-8">
      <header className="max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Image
            src="/pomegranate.png"
            alt="Pomegranate"
            width={32}
            height={32}
          />
          Hades Pomegranates
        </h1>
        <p className="text-lg sm:text-xl text-foreground/80 mb-6 sm:mb-8">
          RPG Tools for Gamers
        </p>
      </header>

      <main className="max-w-5xl mx-auto">
        <section className="mb-12">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 sm:p-6 border rounded-lg">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Lodestone</h2>
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

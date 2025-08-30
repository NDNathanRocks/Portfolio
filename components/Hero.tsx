export default function Hero() {
  return (
    <section className="container py-16 md:py-24">
      <div className="max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold leading-[1.1]">Hi, I'm Nathan — I build useful, efficient software.</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Computing Science graduate focusing on AI, automation, and delightful UI. Scroll to explore my work.
        </p>
        <div className="mt-6 flex gap-4">
          <a href="#projects" className="rounded-xl bg-brand-600 px-5 py-2.5 text-white shadow-soft hover:bg-brand-700 transition">View Projects</a>
          <a href="#contact" className="rounded-xl border border-black/10 dark:border-white/10 px-5 py-2.5 shadow-soft hover:bg-black/5 dark:hover:bg-white/5 transition">Contact</a>
        </div>
      </div>
    </section>
  );
}

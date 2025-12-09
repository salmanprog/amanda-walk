"use client";
import { useEffect } from "react";

export default function HomePage() {
  // Set page title
  useEffect(() => {
    document.title = "Amanda Site | Coming Soon";
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--secondary-theme)] via-[var(--secondary-theme-light)] to-[var(--secondary-theme)]">
      <div className="text-center px-4">
        <h1 className="text-6xl md:text-8xl font-bold text-[var(--primary-theme)] mb-6 font-[var(--font-primary-font)] animate-pulse">
          Coming Soon
        </h1>
        <h2 className="text-3xl md:text-5xl text-white mb-4 font-[var(--secondary-font)]">
          Amanda Site
        </h2>
        <p className="text-xl md:text-2xl text-gray-300 mt-8 font-[var(--secondary-font)]">
          We're working on something amazing!
        </p>
      </div>
    </section>
  );
}

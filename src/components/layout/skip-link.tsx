export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only z-50 rounded-[var(--radius-control)] bg-[var(--color-ink)] px-4 py-3 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
    >
      Lewati ke konten utama
    </a>
  );
}

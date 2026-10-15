type SpinnerProps = {
  size?: "sm" | "md";
  label?: string;
};

export function Spinner({ size = "md", label = "Memproses" }: SpinnerProps) {
  const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <span className="inline-flex items-center gap-2" role="status">
      <span
        aria-hidden="true"
        className={`${sizeClass} animate-spin rounded-full border-2 border-current border-t-transparent`}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

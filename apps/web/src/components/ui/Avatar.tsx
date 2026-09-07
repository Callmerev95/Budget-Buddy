function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Avatar inisial (pola Fundex). */
export function Avatar({
  name,
  className = "",
  label,
}: {
  name: string;
  className?: string;
  label?: string;
}) {
  const initials = initialsOf(name) || "?";
  return (
    <span
      role="img"
      aria-label={label ?? name}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent ${className}`}
    >
      {initials}
    </span>
  );
}

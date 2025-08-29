import { useMemo } from "react";

export default function RatingStars({
  value = 0,
  onChange, // optional -> makes it interactive
  size = "text-xl", // text-sm | text-base | text-lg | text-xl | text-2xl
  className = "",
}) {
  const stars = useMemo(() => [1, 2, 3, 4, 5], []);
  const rounded = Math.round((Number(value) || 0) * 2) / 2;

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {stars.map((n) => {
        const filled = rounded >= n;
        const half = !filled && rounded + 0.5 >= n;
        const common = "cursor-pointer transition-transform active:scale-95";

        if (onChange) {
          return (
            <button
              key={n}
              type="button"
              aria-label={`Set rating ${n}`}
              onClick={() => onChange(n)}
              className={common}
            >
              <StarIcon filled={filled} half={half} size={size} />
            </button>
          );
        }
        return <StarIcon key={n} filled={filled} half={half} size={size} />;
      })}
    </div>
  );
}

function StarIcon({ filled, half, size }) {
  // Tailwind color palette aligned with your brand (indigo accent)
  const base = filled || half ? "text-indigo-600" : "text-gray-300";
  return (
    <span className={`${size} ${base}`}>{half ? "★" : filled ? "★" : "☆"}</span>
  );
}

import { Card } from "@/lib/cards";

const suitColors: Record<Card["suit"], string> = {
  "♠": "text-slate-900",
  "♣": "text-slate-900",
  "♥": "text-rose-600",
  "♦": "text-rose-600",
};

export const CardVisual = ({
  card,
  size = "lg",
  compact = false,
  rotate = 0,
  animate = true,
}: {
  card: Card;
  size?: "lg" | "md" | "sm";
  compact?: boolean;
  rotate?: number;
  animate?: boolean;
}) => {
  const base =
    size === "lg"
      ? "h-28 w-20 text-2xl"
      : size === "md"
        ? "h-20 w-14 text-xl"
        : "h-16 w-12 text-lg";

  return (
    <div
      className={`card-visual relative flex items-center justify-center rounded-xl ${base} ${
        animate ? "animate-deal" : ""
      }`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className="absolute left-2 top-2 text-xs font-semibold leading-none">
        <span className={suitColors[card.suit]}>{card.rank}</span>
        <span className={`${suitColors[card.suit]} ml-[1px]`}>{card.suit}</span>
      </div>
      <div className="absolute right-2 bottom-2 text-xs font-semibold leading-none rotate-180">
        <span className={suitColors[card.suit]}>{card.rank}</span>
        <span className={`${suitColors[card.suit]} ml-[1px]`}>{card.suit}</span>
      </div>
      {!compact ? (
        <span className={`font-semibold ${suitColors[card.suit]}`}>
          {card.rank}
          <span className="ml-1">{card.suit}</span>
        </span>
      ) : null}
    </div>
  );
};


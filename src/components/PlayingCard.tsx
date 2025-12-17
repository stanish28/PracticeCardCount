import { Card } from "@/lib/cards";

type PlayingCardProps = {
  card: Card;
  size?: "sm" | "md" | "lg";
  faded?: boolean;
  watermark?: boolean;
  animateKey?: string | number;
};

const suitColor = (suit: Card["suit"]) =>
  suit === "♥" || suit === "♦" ? "text-red-600" : "text-slate-900";

const sizeClasses = {
  sm: { box: "w-8 h-11", corner: "text-xs", center: "text-lg" },
  md: { box: "w-16 h-24", corner: "text-sm", center: "text-2xl" },
  lg: { box: "w-24 h-32", corner: "text-base", center: "text-3xl" },
};

export const PlayingCard = ({
  card,
  size = "lg",
  faded = false,
  watermark = true,
  animateKey,
}: PlayingCardProps) => {
  const s = sizeClasses[size];
  return (
    <div
      key={animateKey ?? `${card.rank}${card.suit}`}
      className={`relative flex items-center justify-center rounded-xl border border-slate-200/50 bg-neutral-50 shadow-[0_6px_16px_rgba(0,0,0,0.6)] transition duration-200 ease-out ${
        s.box
      } ${faded ? "opacity-40" : "opacity-100"}`}
    >
      <div className={`absolute left-1 top-1 font-semibold leading-none ${s.corner}`}>
        <span className={suitColor(card.suit)}>{card.rank}</span>
        <span className={`${suitColor(card.suit)} ml-[2px]`}>{card.suit}</span>
      </div>
      <div
        className={`absolute right-1 bottom-1 rotate-180 font-semibold leading-none ${s.corner}`}
      >
        <span className={suitColor(card.suit)}>{card.rank}</span>
        <span className={`${suitColor(card.suit)} ml-[2px]`}>{card.suit}</span>
      </div>
      {watermark ? (
        <div className={`text-center font-semibold opacity-30 ${s.center} ${suitColor(card.suit)}`}>
          {card.suit}
        </div>
      ) : null}
    </div>
  );
};


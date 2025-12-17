export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

export type Suit = "♠" | "♥" | "♦" | "♣";

export type Card = {
  rank: Rank;
  suit: Suit;
};

const ranks: Rank[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

const suits: Suit[] = ["♠", "♥", "♦", "♣"];

const hiLoValues: Record<Rank, number> = {
  "2": 1,
  "3": 1,
  "4": 1,
  "5": 1,
  "6": 1,
  "7": 0,
  "8": 0,
  "9": 0,
  "10": -1,
  J: -1,
  Q: -1,
  K: -1,
  A: -1,
};

export const buildShoe = (numDecks: number): Card[] => {
  const shoe: Card[] = [];
  for (let d = 0; d < numDecks; d += 1) {
    for (const rank of ranks) {
      for (const suit of suits) {
        shoe.push({ rank, suit });
      }
    }
  }
  return shoe;
};

export const shuffle = (cards: Card[]): Card[] => {
  const copy = [...cards];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const getHiLoValue = (card: Card): number => hiLoValues[card.rank];

export const formatCard = (card: Card | null | undefined): string => {
  if (!card) return "—";
  return `${card.rank}${card.suit}`;
};

export const handValue = (hand: Card[]): { total: number; soft: boolean } => {
  let total = 0;
  let aces = 0;
  for (const card of hand) {
    if (card.rank === "A") {
      total += 11;
      aces += 1;
    } else if (["K", "Q", "J", "10"].includes(card.rank)) {
      total += 10;
    } else {
      total += Number(card.rank);
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return { total, soft: aces > 0 };
};


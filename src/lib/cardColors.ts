const CARD_COLORS = [
  "#F87171", // red
  "#60A5FA", // blue
  "#34D399", // green
  "#FBBF24", // yellow
  "#A78BFA", // purple
  "#FB7185", // pink
  "#F472B6", // fuchsia
  "#FB923C", // orange
];

export function getRandomColor(): string {
  const index = Math.floor(Math.random() * CARD_COLORS.length);
  return CARD_COLORS[index];
}

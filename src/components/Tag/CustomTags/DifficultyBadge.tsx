/**
 * DifficultyBadge component.
 *
 * Displays a visual badge representing the difficulty level of a recipe
 * (easy, medium, hard) using the shared Tag component.
 *
 * The badge applies a color-coded background based on difficulty:
 * - easy → success color
 * - medium → warning color
 * - hard → danger color
 *
 * It can optionally act as an interactive element. When clicked, the click
 * event is stopped from propagating to parent elements (e.g. recipe cards)
 * to avoid unintended navigation or selection.
 *
 * This component is typically used in recipe cards, filters, or detail views
 * to quickly communicate recipe complexity.
 */

import Tag from "@/components/Tag/Tag";

interface Props {
  level: "easy" | "medium" | "hard";
  onClick?: () => void;
}

const COLORS: Record<Props["level"], string> = {
  easy: "var(--color-success)",
  medium: "var(--color-warning)",
  hard: "var(--color-danger)",
};

export function DifficultyBadge({ level, onClick }: Props) {
  return (
    <Tag
      label={level.charAt(0).toUpperCase() + level.slice(1)}
      active
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      removable={false}
      bgColor={COLORS[level]}
    />
  );
}
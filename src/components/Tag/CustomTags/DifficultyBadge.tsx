import Tag from "@/components/Tag/Tag";

interface Props { level: "easy" | "medium" | "hard"; }

const colors: Record<Props["level"], string> = {
  easy: "var(--color-success)",
  medium: "var(--color-warning)",
  hard: "var(--color-danger)",
};

export function DifficultyBadge({ level, onClick }: Props & { onClick?: () => void }) {
  const colors: Record<typeof level, string> = {
    easy: "var(--color-success)",
    medium: "var(--color-warning)",
    hard: "var(--color-danger)",
  };

  return (
    <Tag
      label={level.charAt(0).toUpperCase() + level.slice(1)}
      active
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      removable={false}
      bgColor={colors[level]}
    />
  );
}

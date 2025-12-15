import Tag from "@/components/Tag/Tag";
import { dietaryIcons, dietaryLabels } from "@/lib/constants/dietary";

interface Props { type: string; }

export function DietaryBadge({ type, onClick }: Props & { onClick?: () => void }) {
  return (
    <Tag
      label={`${dietaryIcons[type]} ${dietaryLabels[type]}`}
      active
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      removable={false}
      bgColor="var(--color-success)"
    />
  );
}

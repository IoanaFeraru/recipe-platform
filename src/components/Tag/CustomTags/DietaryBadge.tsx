/**
 * DietaryBadge component.
 *
 * Renders a visual badge representing a dietary classification (e.g. vegan,
 * vegetarian, gluten-free) using the shared Tag component.
 *
 * The badge combines a predefined icon and human-readable label sourced from
 * centralized dietary constants, ensuring consistency across the application.
 * It uses a success-themed background color to indicate a positive dietary
 * attribute.
 *
 * The badge can optionally be interactive. When clicked, the click event is
 * stopped from propagating to parent elements (such as recipe cards) to avoid
 * unintended navigation or selection.
 *
 * Typical use cases include recipe cards, filters, and recipe detail views
 * where dietary information needs to be quickly and clearly communicated.
 */

import Tag from "@/components/Tag/Tag";
import { dietaryIcons, dietaryLabels } from "@/lib/constants/dietary";

interface Props {
  type: string;
  onClick?: () => void;
}

export function DietaryBadge({ type, onClick }: Props) {
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
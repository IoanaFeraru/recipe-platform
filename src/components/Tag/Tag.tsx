interface TagProps {
  label: string;
  active?: boolean;
  onClick?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
  removable?: boolean;
  onRemove?: () => void;
  bgColor?: string;
}

export default function Tag({
  label,
  active = false,
  onClick,
  removable = false,
  onRemove,
  bgColor,
}: TagProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm
        transition-all
        ${onClick ? "cursor-pointer hover:brightness-110" : ""}
        ${active
          ? "text-white border-(--color-primary)"
          : "text-(--color-text-muted) border-(--color-border)"
        }
      `}
      onClick={onClick}
      style={{ backgroundColor: bgColor }}
    >
      {label}
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:text-(--color-danger)"
        >
          ×
        </button>
      )}
    </span>
  );
}

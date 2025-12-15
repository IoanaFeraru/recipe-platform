"use client";

interface TagProps {
  label: string;
  active?: boolean;
  onClick?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
  removable?: boolean;
  onRemove?: () => void;
}

export default function Tag({ label, active = false, onClick, removable = false, onRemove }: TagProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm
        border-2 transition-all
        ${onClick ? 'cursor-pointer hover:brightness-110' : ''}
        ${active 
          ? 'bg-(--color-primary) text-white border-(--color-primary)' 
          : 'bg-(--color-bg-secondary) text-(--color-text-muted) border-(--color-border)'
        }
      `}
      onClick={onClick}
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